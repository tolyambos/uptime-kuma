#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Check both possible database locations
const dataDb = path.join(__dirname, 'data', 'kuma.db');
const prodDb = '/data/kuma.db';

function checkDatabase(dbPath, label) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Checking ${label}: ${dbPath}`);
    console.log('='.repeat(50));
    
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(`Cannot open database: ${err.message}`);
            return;
        }
        
        console.log('Database opened successfully');
        
        // Check monitors
        db.get("SELECT COUNT(*) as count FROM monitor", (err, row) => {
            if (err) {
                console.error('Error counting monitors:', err);
            } else {
                console.log(`Total monitors: ${row.count}`);
            }
        });
        
        // Check active monitors
        db.get("SELECT COUNT(*) as count FROM monitor WHERE active = 1", (err, row) => {
            if (err) {
                console.error('Error counting active monitors:', err);
            } else {
                console.log(`Active monitors: ${row.count}`);
            }
        });
        
        // Check users
        db.get("SELECT COUNT(*) as count FROM user", (err, row) => {
            if (err) {
                console.error('Error counting users:', err);
            } else {
                console.log(`Total users: ${row.count}`);
                
                if (row.count === 0) {
                    console.log('\n⚠️  WARNING: No users found!');
                    console.log('This is why you see no monitors in the UI.');
                    console.log('You need to create a user account first.');
                }
            }
        });
        
        // Sample monitors
        db.all("SELECT id, name, url, user_id FROM monitor LIMIT 5", (err, rows) => {
            if (err) {
                console.error('Error fetching monitors:', err);
            } else {
                console.log('\nSample monitors:');
                rows.forEach(row => {
                    console.log(`  ID: ${row.id} | User: ${row.user_id} | Name: ${row.name}`);
                });
            }
        });
        
        // Check tags
        db.get("SELECT COUNT(*) as count FROM tag", (err, row) => {
            if (err) {
                console.error('Error counting tags:', err);
            } else {
                console.log(`\nTotal tags: ${row.count}`);
            }
        });
        
        // Check monitor-tag associations
        db.get("SELECT COUNT(*) as count FROM monitor_tag", (err, row) => {
            if (err) {
                console.error('Error counting monitor-tag associations:', err);
            } else {
                console.log(`Tag assignments: ${row.count}`);
            }
        });
        
        // Close database
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
        });
    });
}

// Check local database
if (require('fs').existsSync(dataDb)) {
    checkDatabase(dataDb, 'LOCAL DATABASE');
}

// Check production database (if running in production)
if (require('fs').existsSync(prodDb)) {
    checkDatabase(prodDb, 'PRODUCTION DATABASE');
}

console.log('\n' + '='.repeat(50));
console.log('DATABASE CHECK COMPLETE');
console.log('='.repeat(50));