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
```
```sql
INSERT INTO keywords VALUES ('yourterm');
```

## Running

```sh
npm start
```

The process connects to the Bluesky firehose and inserts matching posts into `posts.db`. It will exit with an error if no keywords are in the database.

You can see some examples [here](examples.sql) and run `duckdb -ui posts.db` for a nice console.