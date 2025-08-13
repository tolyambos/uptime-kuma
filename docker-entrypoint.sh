#!/bin/sh

echo "Starting Uptime Kuma with database check..."

# Check if we're in production (Railway sets DATA_DIR to /data)
if [ "$DATA_DIR" = "/data" ] || [ -d "/data" ]; then
    echo "Production environment detected"
    
    # If no database exists in /data, copy our template
    if [ ! -f "/data/kuma.db" ]; then
        echo "No production database found. Copying template with 399 monitors..."
        cp ./db/kuma.db /data/kuma.db
        echo "Database with 399 monitors copied to production!"
    else
        echo "Existing production database found at /data/kuma.db"
        # Count monitors
        monitor_count=$(sqlite3 /data/kuma.db "SELECT COUNT(*) FROM monitor" 2>/dev/null || echo "Error")
        echo "Current monitor count: $monitor_count"
        
        if [ "$FORCE_DB_REPLACE" = "true" ]; then
            echo "FORCE_DB_REPLACE is set. Replacing database..."
            cp ./db/kuma.db /data/kuma.db
            echo "Database replaced with 399 monitors!"
        fi
    fi
fi

# Start the application
exec npm start