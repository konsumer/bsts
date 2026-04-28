CREATE TABLE IF NOT EXISTS keywords (
  keyword VARCHAR PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS posts (
  uri        VARCHAR PRIMARY KEY,
  author     VARCHAR,
  text       VARCHAR,
  created_at TIMESTAMPTZ,
  matched    VARCHAR[],
  record     JSON
);

INSERT OR IGNORE INTO keywords VALUES
  ('Trump'),
  ('MAGA'),
  ('president'),
  ('Fake news'),
  ('Make America Great Again'),
  ('America First'),
  ('Law and order'),
  ('Mar-a-Lago'),
  ('executive order'),
  ('border');
