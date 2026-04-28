-- recent matches
SELECT author, text, matched, created_at
FROM posts
ORDER BY created_at DESC
LIMIT 20;

-- which keywords are firing most
SELECT keyword, count(*) AS hits
FROM (SELECT unnest(matched) AS keyword FROM posts)
GROUP BY 1
ORDER BY 2 DESC;

-- posts matching a specific keyword
SELECT text FROM posts WHERE list_contains(matched, 'bitcoin');

-- posts per author
SELECT author, count(*) AS posts
FROM posts
GROUP BY author
ORDER BY 2 DESC;