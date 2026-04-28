# bsts — Bluesky Firehose Search

Monitors the Bluesky firehose in real time and saves posts that match a list of keywords to a local DuckDB database.

## Requirements

- Node.js 22+
- [DuckDB CLI](https://duckdb.org/docs/installation/) (optional, for querying)

## Setup

```sh
npm install
```

The database file `posts.db` is created automatically on first run. To set it up and add keywords before starting:

```sh
duckdb posts.db < setup.sql
duckdb posts.db "INSERT INTO keywords VALUES ('bitcoin'), ('ethereum'), ('bluesky');"
```

Or add keywords interactively:

```sh
duckdb posts.db
INSERT INTO keywords VALUES ('yourterm');
```

## Running

```sh
node index.js
```

The process connects to the Bluesky firehose and inserts matching posts into `posts.db`. It will exit with an error if no keywords are in the database.

To restart with updated keywords, just stop and re-run — the automaton is built from the database at startup.

## Querying results

Open the database with `duckdb posts.db`, then:

```sql
-- recent matches
SELECT author, text, matched, created_at
FROM posts
ORDER BY created_at DESC
LIMIT 20;

-- which keywords are firing most
SELECT unnest(matched) AS keyword, count(*) AS hits
FROM posts
GROUP BY 1
ORDER BY 2 DESC;

-- posts matching a specific keyword
SELECT text FROM posts WHERE list_contains(matched, 'bitcoin');

-- posts per author
SELECT author, count(*) AS posts
FROM posts
GROUP BY author
ORDER BY 2 DESC;
```

## Schema

**`keywords`** — terms to watch for (case-insensitive, Aho-Corasick matched)

| column | type | description |
|---|---|---|
| keyword | VARCHAR | the search term |

**`posts`** — matched posts from the firehose

| column | type | description |
|---|---|---|
| uri | VARCHAR | unique AT-protocol URI for the post |
| author | VARCHAR | author's DID |
| text | VARCHAR | post text |
| created_at | TIMESTAMPTZ | when the post was created |
| matched | VARCHAR[] | which keywords matched |
| record | JSON | full raw post record (embeds, reply, langs, facets…) |
