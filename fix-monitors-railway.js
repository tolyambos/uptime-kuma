#!/usr/bin/env node
/**
 * This script fixes the monitor assignment issue in production
 * Run this AFTER deployment to assign all monitors to the existing user
 */

const Database = require("./server/database");
const { R } = require("redbean-node");

(async () => {
    console.log("Starting monitor fix for Railway production...");
    
    // Connect to database
    await Database.connect();
    
    try {
        // Check for users
        const users = await R.getAll("SELECT id, username FROM user");
        console.log(`Found ${users.length} users:`, users);
        
        if (users.length === 0) {
            console.log("ERROR: No users found! Please create a user first.");
            process.exit(1);
        }
        
        const firstUser = users[0];
        console.log(`Using user: ${firstUser.username} (ID: ${firstUser.id})`);
        
        // Check monitors without user
        const unassignedCount = await R.count("monitor", "user_id IS NULL OR user_id = ?", ['']);
        console.log(`Found ${unassignedCount} monitors without user assignment`);
        
        if (unassignedCount > 0) {
            // Assign all monitors to first user
            const result = await R.exec(
                "UPDATE monitor SET user_id = ? WHERE user_id IS NULL OR user_id = ?",
                [firstUser.id, '']
            );
            console.log(`Updated monitors - assigned to user ${firstUser.username}`);
            
            // Verify
            const assignedCount = await R.count("monitor", "user_id = ?", [firstUser.id]);
            console.log(`User ${firstUser.username} now has ${assignedCount} monitors`);
        } else {
            console.log("All monitors already assigned!");
        }
        
        // Show summary
        const totalMonitors = await R.count("monitor");
        const activeMonitors = await R.count("monitor", "active = 1");
        console.log(`\nSummary:`);
        console.log(`- Total monitors: ${totalMonitors}`);
        console.log(`- Active monitors: ${activeMonitors}`);
        console.log(`- All assigned to: ${firstUser.username}`);
        
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    } finally {
        await Database.close();
        console.log("\nMonitor fix completed!");
        process.exit(0);
    }
})();