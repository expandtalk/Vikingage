-- 20260723150150_kg_predicate_dynasty_objecttype.sql
-- Dynasti-noder är dubbeltypade (dynasty + source) MEDVETET — se dynasty-as-source-intent.
-- Trigger check_relationship_types() enforcar objekt-typ; '*' = valfri typ tillåten.
-- Låter belongs_to_dynasty länka till både 'dynasty'- och 'source'-typade dynasti-noder.
UPDATE rel_predicates SET object_type = '*' WHERE code = 'belongs_to_dynasty';
