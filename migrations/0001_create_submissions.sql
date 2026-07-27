-- Migration: Create AIGC registration and enterprise submission tables

CREATE TABLE IF NOT EXISTS aigc_submissions (
  id             TEXT PRIMARY KEY,
  phone          TEXT NOT NULL,
  name           TEXT NOT NULL,
  city           TEXT NOT NULL,
  wechat         TEXT NOT NULL,
  identity       TEXT NOT NULL,
  paths          TEXT NOT NULL,       -- JSON array
  stage          TEXT NOT NULL,
  directions     TEXT NOT NULL,       -- JSON array
  intro          TEXT NOT NULL,
  material_links TEXT,
  file_name      TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS enterprise_submissions (
  id             TEXT PRIMARY KEY,
  phone          TEXT NOT NULL,
  organization   TEXT NOT NULL,
  industry       TEXT NOT NULL,
  city           TEXT NOT NULL,
  contact        TEXT NOT NULL,
  wechat         TEXT,
  needs          TEXT NOT NULL,       -- JSON array
  description    TEXT NOT NULL,
  cooperation    TEXT NOT NULL,
  material_link  TEXT,
  file_name      TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_aigc_phone ON aigc_submissions(phone);
CREATE INDEX IF NOT EXISTS idx_enterprise_phone ON enterprise_submissions(phone);
