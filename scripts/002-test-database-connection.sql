-- Test script to verify database connection and schema
SELECT name FROM sqlite_master WHERE type='table';

-- Check if tables exist and are properly structured
SELECT sql FROM sqlite_master WHERE type='table' AND name IN ('users', 'oauth_tokens', 'user_sessions');

-- Clean up any test data (optional)
-- DELETE FROM user_sessions WHERE created_at < datetime('now', '-1 day');
-- DELETE FROM oauth_tokens WHERE created_at < datetime('now', '-1 day');
-- DELETE FROM users WHERE created_at < datetime('now', '-1 day');
