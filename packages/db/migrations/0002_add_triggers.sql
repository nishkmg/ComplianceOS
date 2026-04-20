-- Trigger 1: Maintain is_leaf on accounts
-- When an account gets a child, set parent's is_leaf = false
-- When all children removed, set parent's is_leaf = true

CREATE OR REPLACE FUNCTION update_parent_is_leaf() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.parent_id IS NOT NULL THEN
      UPDATE accounts SET is_leaf = false WHERE id = NEW.parent_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.parent_id IS DISTINCT FROM NEW.parent_id THEN
      IF OLD.parent_id IS NOT NULL THEN
        UPDATE accounts SET is_leaf = true
        WHERE id = OLD.parent_id
          AND NOT EXISTS (SELECT 1 FROM accounts WHERE parent_id = OLD.parent_id AND id != NEW.id);
      END IF;
      IF NEW.parent_id IS NOT NULL THEN
        UPDATE accounts SET is_leaf = false WHERE id = NEW.parent_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.parent_id IS NOT NULL THEN
      UPDATE accounts SET is_leaf = true
      WHERE id = OLD.parent_id
        AND NOT EXISTS (SELECT 1 FROM accounts WHERE parent_id = OLD.parent_id);
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_accounts_is_leaf ON accounts;
CREATE TRIGGER trg_accounts_is_leaf
  AFTER INSERT OR UPDATE OF parent_id OR DELETE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_parent_is_leaf();

-- Trigger 2: Enforce debit = credit on journal entry lines
-- Note: Only enforced for posted entries. Drafts are allowed to be unbalanced while editing.

CREATE OR REPLACE FUNCTION check_je_balance() RETURNS TRIGGER AS $$
DECLARE
  total_debit NUMERIC(18,2);
  total_credit NUMERIC(18,2);
  je_status TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    je_status := (SELECT status FROM journal_entries WHERE id = NEW.journal_entry_id);
    IF je_status = 'posted' THEN
      SELECT COALESCE(SUM(debit), 0), COALESCE(SUM(credit), 0)
      INTO total_debit, total_credit
      FROM journal_entry_lines
      WHERE journal_entry_id = NEW.journal_entry_id;
      IF total_debit != total_credit THEN
        RAISE EXCEPTION 'Journal entry is unbalanced: debits = %, credits = %', total_debit, total_credit;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    je_status := (SELECT status FROM journal_entries WHERE id = NEW.journal_entry_id);
    IF je_status = 'posted' THEN
      SELECT COALESCE(SUM(debit), 0), COALESCE(SUM(credit), 0)
      INTO total_debit, total_credit
      FROM journal_entry_lines
      WHERE journal_entry_id = NEW.journal_entry_id;
      IF total_debit != total_credit THEN
        RAISE EXCEPTION 'Journal entry is unbalanced: debits = %, credits = %', total_debit, total_credit;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    je_status := (SELECT status FROM journal_entries WHERE id = OLD.journal_entry_id);
    IF je_status = 'posted' THEN
      SELECT COALESCE(SUM(debit), 0), COALESCE(SUM(credit), 0)
      INTO total_debit, total_credit
      FROM journal_entry_lines
      WHERE journal_entry_id = OLD.journal_entry_id;
      IF total_debit != total_credit THEN
        RAISE EXCEPTION 'Journal entry is unbalanced: debits = %, credits = %', total_debit, total_credit;
      END IF;
    END IF;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_je_balance_check ON journal_entry_lines;
CREATE TRIGGER trg_je_balance_check
  AFTER INSERT OR UPDATE OR DELETE ON journal_entry_lines
  FOR EACH ROW EXECUTE FUNCTION check_je_balance();
