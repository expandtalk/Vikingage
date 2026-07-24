-- 20260723160200_estate_holdings_validate.sql
CREATE OR REPLACE FUNCTION check_estate_holding_vocab()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.acquired_via IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM vocabulary WHERE scheme='acquisition_mode' AND code=NEW.acquired_via) THEN
    RAISE EXCEPTION 'estate_holdings: okänd acquired_via "%"', NEW.acquired_via;
  END IF;
  IF NEW.holder_kind IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM vocabulary WHERE scheme='holder_kind' AND code=NEW.holder_kind) THEN
    RAISE EXCEPTION 'estate_holdings: okänd holder_kind "%"', NEW.holder_kind;
  END IF;
  IF NEW.from_holder_kind IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM vocabulary WHERE scheme='holder_kind' AND code=NEW.from_holder_kind) THEN
    RAISE EXCEPTION 'estate_holdings: okänd from_holder_kind "%"', NEW.from_holder_kind;
  END IF;
  IF NEW.fiscal_system IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM vocabulary WHERE scheme='fiscal_system' AND code=NEW.fiscal_system) THEN
    RAISE EXCEPTION 'estate_holdings: okänd fiscal_system "%"', NEW.fiscal_system;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_estate_holding_vocab ON estate_holdings;
CREATE TRIGGER trg_estate_holding_vocab
  BEFORE INSERT OR UPDATE ON estate_holdings
  FOR EACH ROW EXECUTE FUNCTION check_estate_holding_vocab();
