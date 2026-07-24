-- 20260723160100_estate_holdings_transferor.sql
ALTER TABLE estate_holdings
  ADD COLUMN IF NOT EXISTS from_holder_kind text,
  ADD COLUMN IF NOT EXISTS from_king_id uuid REFERENCES historical_kings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS from_dynasty_id uuid REFERENCES royal_dynasties(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_estate_holdings_estate_period
  ON estate_holdings (estate_id, period_start);
