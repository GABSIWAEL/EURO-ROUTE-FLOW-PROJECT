-- Only create indexes if the page_views table exists (prevents errors on minimal deployments)
DO $$
BEGIN
  IF to_regclass('public.page_views') IS NOT NULL THEN
    -- Index on view_time for faster time-range queries
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_view_time ON page_views(view_time DESC)';

    -- Index on page_type for filtering by page type
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_view_type ON page_views(page_type)';

    -- Composite index for common query pattern (page_type + view_time)
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_view_type_time ON page_views(page_type, view_time DESC)';

    -- Index on session_id for session uniqueness queries
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_view_session ON page_views(session_id)';

    -- Index on view_time + session_id for unique session counting
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_view_session_time ON page_views(view_time, session_id)';

    -- Compound index for dashboard queries
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_view_dashboard ON page_views(page_type, view_time DESC, session_id)';

    -- Optional: Index on referrer for analysis
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_view_referrer ON page_views(referrer)';

    -- Analyze table statistics after indexing (for query optimizer)
    EXECUTE 'ANALYZE page_views';
  END IF;
END$$;
