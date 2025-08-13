#!/usr/bin/env node
// Migration script to update production database with new monitors
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Determine database path
const dataDir = process.env.DATA_DIR || './data';
const prodDbPath = path.join(dataDir, 'kuma.db');
const templateDbPath = './db/kuma.db';

console.log('='.repeat(50));
console.log('PRODUCTION DATABASE MIGRATION');
console.log('='.repeat(50));
console.log('Production DB path:', prodDbPath);
console.log('Template DB path:', templateDbPath);

// Check if production database exists
if (!fs.existsSync(prodDbPath)) {
    console.log('No production database found. Copying template database...');
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Copy template database to production
    fs.copyFileSync(templateDbPath, prodDbPath);
    console.log('Template database copied to production location.');
    console.log('Migration complete - 399 monitors ready!');
    process.exit(0);
}

console.log('Production database exists. Starting migration...');

// Open production database
const db = new sqlite3.Database(prodDbPath);

// Migration operations
db.serialize(() => {
    // Check current monitor count
    db.get("SELECT COUNT(*) as count FROM monitor", (err, row) => {
        if (err) {
            console.error('Error checking monitors:', err);
            return;
        }
        
        console.log(`Current monitors in production: ${row.count}`);
        
        if (row.count > 0) {
            console.log('\nWARNING: Production database already has monitors!');
            console.log('To replace with new monitors, you need to:');
            console.log('1. Delete the volume in Railway dashboard');
            console.log('2. Redeploy the application');
            console.log('3. The new database with 399 monitors will be used');
            
            // Or uncomment below to force replacement (DANGEROUS - will delete all existing data!)
            /*
            console.log('\nFORCE REPLACING DATABASE...');
            db.run("DELETE FROM heartbeat", (err) => {
                if (err) console.error('Error deleting heartbeats:', err);
            });
            db.run("DELETE FROM monitor_notification", (err) => {
                if (err) console.error('Error deleting monitor notifications:', err);
            });
            db.run("DELETE FROM monitor", (err) => {
                if (err) console.error('Error deleting monitors:', err);
                else {
                    console.log('Existing monitors deleted.');
                    // Copy new database
                    db.close(() => {
                        fs.copyFileSync(templateDbPath, prodDbPath);
                        console.log('New database copied. 399 monitors ready!');
                    });
                }
            });
            */
        } else {
            // No monitors, safe to copy new database
            console.log('No monitors found. Copying new database...');
            db.close(() => {
                fs.copyFileSync(templateDbPath, prodDbPath);
                console.log('New database copied. 399 monitors ready!');
            });
        }
    });
});

// Close database on exit
process.on('exit', () => {
    db.close();
});