import { Firehose } from '@skyware/firehose'
import AhoCorasick from 'aho-corasick-node'
import { readFile } from 'node:fs/promises'

const keywords = (await readFile('wordlist.txt', 'utf8')).split('\n').map(s => s.trim()).filter(s => s)

// this is more complicated than it needs to be, but does faster matches for >50 keywords
const builder = AhoCorasick.builder()
keywords.forEach(k => builder.add(k))
const ac = builder.build()

const firehose = new Firehose()
firehose.on('commit', commit => {
	for (const op of commit.ops) {
		if (op.action === 'create' && op.path.startsWith('app.bsky.feed.post/')) {
			const text = op.record?.text
			if (text) {
				const matches = ac.match(text.toLowerCase())
				if (matches.length) {
					const { action , path, record } = op
					const { langs, createdAt } = record
					console.log({ author: commit.repo, path, langs, createdAt, text, matches })
				}
			}
		}
	}
})
firehose.start()