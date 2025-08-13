-- Check current state
SELECT 'Current users:' as info;
SELECT id, username FROM user;

SELECT 'Monitors without user:' as info;
SELECT COUNT(*) as unassigned_monitors FROM monitor WHERE user_id IS NULL OR user_id = '';

SELECT 'Sample unassigned monitors:' as info;
SELECT id, name, user_id FROM monitor WHERE user_id IS NULL OR user_id = '' LIMIT 5;

-- Assign all monitors to the first user (sitefarm)
UPDATE monitor 
SET user_id = (SELECT id FROM user WHERE username = 'sitefarm' OR id = 1 LIMIT 1)
WHERE user_id IS NULL OR user_id = '';

-- Verify the fix
SELECT 'After update - Monitors assigned to users:' as info;
SELECT u.username, COUNT(m.id) as monitor_count 
FROM user u 
LEFT JOIN monitor m ON u.id = m.user_id 
GROUP BY u.id, u.username;

SELECT 'Total active monitors:' as info;
SELECT COUNT(*) FROM monitor WHERE active = 1;