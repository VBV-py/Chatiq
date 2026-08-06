CREATE TABLE IF NOT EXISTS stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);
