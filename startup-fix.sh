#!/bin/sh
echo "Starting Uptime Kuma with monitor fix..."

# Function to fix monitors after user creation
fix_monitors() {
    if [ -f "/data/kuma.db" ]; then
        # Check if there's a user but monitors have no user_id
        user_count=$(sqlite3 /data/kuma.db "SELECT COUNT(*) FROM user" 2>/dev/null || echo "0")
        monitors_without_user=$(sqlite3 /data/kuma.db "SELECT COUNT(*) FROM monitor WHERE user_id IS NULL" 2>/dev/null || echo "0")
        
        if [ "$user_count" -gt 0 ] && [ "$monitors_without_user" -gt 0 ]; then
            echo "Found $monitors_without_user monitors without user assignment"
            # Get first user ID
            first_user=$(sqlite3 /data/kuma.db "SELECT id FROM user LIMIT 1" 2>/dev/null)
            if [ -n "$first_user" ]; then
                echo "Assigning monitors to user $first_user..."
                sqlite3 /data/kuma.db "UPDATE monitor SET user_id = $first_user WHERE user_id IS NULL"
                echo "Monitors assigned successfully!"
            fi
        fi
    fi
}

# Run the fix in background after a delay to allow user creation
(sleep 30 && fix_monitors) &

# Start the application
exec npm start