const fs = require('fs');
const path = require('path');

const watchDir = __dirname;
const targetFolder = path.join(__dirname, 'database');
const targetFile = path.join(targetFolder, 'merged_schema.sql');

// Ensure the database folder exists
if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
}

console.log(`\n👁️  SQL Watcher is actively monitoring for new .sql files...`);
console.log(`📂 Any new .sql file dropped in the root folder will be instantly merged and cleaned up.\n`);

fs.watch(watchDir, (eventType, filename) => {
    // Only intercept standalone .sql files that get created or updated
    if (eventType === 'rename' && filename && filename.endsWith('.sql')) {
        const filePath = path.join(watchDir, filename);
        
        // Wait a tiny bit (50ms) to ensure external tools (like pg_dump) have finished writing the file
        setTimeout(() => {
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    
                    // Don't merge empty files
                    if (content.trim().length > 0) {
                        const header = `\n\n/* ═══════════════════════════════════════════════════════════════\n   MERGED AUTOMATICALLY FROM: ${filename} (${new Date().toLocaleString()})\n═══════════════════════════════════════════════════════════════ */\n\n`;
                        
                        fs.appendFileSync(targetFile, header + content, 'utf8');
                        console.log(`✅ Instantly Merged: ${filename} -> database/merged_schema.sql`);
                        
                        // Delete the freshly consumed file to maintain a clean root directory
                        fs.unlinkSync(filePath);
                        console.log(`🗑️  Cleaned up: ${filename}`);
                    }
                } catch (err) {
                    console.error(`❌ Failed to merge ${filename}:`, err.message);
                }
            }
        }, 50);
    }
});
