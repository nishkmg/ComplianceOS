-- Migration 0020: NOTIFY trigger on event_store insert.
-- Worker uses Postgres LISTEN/NOTIFY for sub-100ms pickup, replacing 500ms poll.
-- 5s safety poll remains as fallback. Idempotent.

CREATE OR REPLACE FUNCTION notify_event_store() RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('event_store_channel', NEW.aggregate_id || ':' || NEW.sequence::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS event_store_notify ON event_store;
CREATE TRIGGER event_store_notify
  AFTER INSERT ON event_store
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_store();
