import { Firehose } from '@skyware/firehose'
import AhoCorasick from 'aho-corasick-node'
import { readFile } from 'node:fs/promises'
import { DuckDBInstance, listValue } from '@duckdb/node-api'

const instance = await DuckDBInstance.create('posts.db')
const conn = await instance.connect()

await conn.run(await readFile('setup.sql', 'utf8'))

const keywordRows = await conn.runAndReadAll('SELECT keyword FROM keywords')
const keywords = keywordRows.getRowObjects().map(r => r.keyword)

if (!keywords.length) {
  console.error("No keywords in database. Add some:\n  duckdb posts.db \"INSERT INTO keywords VALUES ('yourterm');\"")
  process.exit(1)
}

const builder = AhoCorasick.builder()
keywords.forEach(k => builder.add(k.toLowerCase()))
const ac = builder.build()

const INSERT_SQL = `
  INSERT OR IGNORE INTO posts (uri, author, text, created_at, matched, record)
  VALUES (?, ?, ?, ?, ?, ?)
`

const firehose = new Firehose()

firehose.on('commit', commit => {
  for (const op of commit.ops) {
    if (op.action !== 'create' || !op.path.startsWith('app.bsky.feed.post/')) continue
    const text = op.record?.text
    if (!text) continue
    const matched = ac.match(text.toLowerCase())
    if (!matched.length) continue

    const uri = `at://${commit.repo}/${op.path}`
    const createdAt = op.record.createdAt ?? new Date().toISOString()

    conn.run(INSERT_SQL, [uri, commit.repo, text, createdAt, listValue(matched), JSON.stringify(op.record)])
      .catch(err => console.error('insert error:', err))

    console.log({text, matched})
  }
})

firehose.start()
console.log(`Watching for ${keywords.length} keywords, storing matches to posts.db`)
