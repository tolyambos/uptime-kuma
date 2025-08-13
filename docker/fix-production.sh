#!/bin/sh
# Fix script for production - assigns monitors to existing user

echo "==================================================="
echo "FIXING MONITOR ASSIGNMENT IN PRODUCTION"
echo "==================================================="

# Wait for database to be available
sleep 5

if [ -f "/data/kuma.db" ]; then
    echo "Found production database at /data/kuma.db"
    
    # Check current state
    echo "\nChecking database state..."
    sqlite3 /data/kuma.db "SELECT 'Users: ' || COUNT(*) FROM user;"
    sqlite3 /data/kuma.db "SELECT 'Unassigned monitors: ' || COUNT(*) FROM monitor WHERE user_id IS NULL OR user_id = '';"
    
    # Get first user
    USER_ID=$(sqlite3 /data/kuma.db "SELECT id FROM user LIMIT 1;")
    USERNAME=$(sqlite3 /data/kuma.db "SELECT username FROM user LIMIT 1;")
    
    if [ -n "$USER_ID" ]; then
        echo "\nAssigning all monitors to user: $USERNAME (ID: $USER_ID)"
        
        # Assign monitors
        sqlite3 /data/kuma.db "UPDATE monitor SET user_id = $USER_ID WHERE user_id IS NULL OR user_id = '';"
        
        # Verify
        ASSIGNED=$(sqlite3 /data/kuma.db "SELECT COUNT(*) FROM monitor WHERE user_id = $USER_ID;")
        echo "Successfully assigned $ASSIGNED monitors to $USERNAME"
    else
        echo "ERROR: No users found in database!"
        echo "Please create a user account first."
    fi
else
    echo "ERROR: Database not found at /data/kuma.db"
fi

echo "\n==================================================="
echo "FIX COMPLETE - Restart the app if needed"
echo "==================================================="