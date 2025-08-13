#!/usr/bin/env node
// This script ensures the database is ready for first run
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATA_DIR ? 
    path.join(process.env.DATA_DIR, 'kuma.db') : 
    path.join(__dirname, 'data', 'kuma.db');

console.log('Fixing database for first run...');
console.log('Database path:', dbPath);

if (!fs.existsSync(dbPath)) {
    console.error('Database not found!');
    process.exit(1);
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Check if setup is needed
    db.get("SELECT value FROM setting WHERE key = 'setupCompleted'", (err, row) => {
        if (err || !row || row.value !== 'true') {
            console.log('Setup not completed, marking as first run...');
            
            // Remove setupCompleted flag to trigger setup
            db.run("DELETE FROM setting WHERE key = 'setupCompleted'", (err) => {
                if (err) console.error('Error removing setupCompleted:', err);
                else console.log('Removed setupCompleted flag');
            });
            
            // Also ensure monitors don't have user_id set
            db.run("UPDATE monitor SET user_id = NULL WHERE user_id IS NOT NULL", (err) => {
                if (err) console.error('Error updating monitors:', err);
                else console.log('Reset monitor user_ids');
            });
        } else {
            console.log('Setup already completed');
        }
    });
    
    // Check user count
    db.get("SELECT COUNT(*) as count FROM user", (err, row) => {
        if (err) {
            console.error('Error checking users:', err);
        } else {
            console.log(`Current user count: ${row.count}`);
            if (row.count === 0) {
                console.log('\n⚠️  No users found - you will need to create an account on first login');
            }
        }
    });
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Database check complete');
});