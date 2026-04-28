  -- posts per author
  SELECT author, count(*) FROM posts GROUP BY author ORDER BY 2 DESC

  -- which keywords fire most
  SELECT unnest(matched) AS keyword, count(*) FROM posts GROUP BY 1 ORDER BY 2 DESC

  -- posts with embeds (from JSON)
  SELECT text FROM posts WHERE record->>'$."embed"' IS NOT NULL
  