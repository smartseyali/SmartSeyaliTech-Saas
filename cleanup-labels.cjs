const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const stat = fs.statSync(path.join(dir, file));
        if (stat.isDirectory()) {
            walk(path.join(dir, file), fileList);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            fileList.push(path.join(dir, file));
        }
    }
    return fileList;
}

const files = walk(path.join(__dirname, 'src', 'pages', 'modules'));

const replacements = {
    "Registry Account identity": "Account Name",
    "Meta Connectivity Node": "Connection",
    "Message Protocol Node": "Message Template",
    "Operational State": "Status",
    "Registry state": "Status",
    "Registry Status": "Status",
    "State": "Status",
    "Execution Hub": "Execution",
    "Meta Entity ID": "Meta ID",
    "Template Node / Logic": "Template Name",
    "Authorization State": "Status",
    "Localization Protocol": "Language",
    "Authentication Protocol": "Authentication",
    "Marketing Campaign Node": "Marketing Campaign",
    "Registry Template identity": "Template Name",
    "Decision State": "Decision",
    "Induction Contact / Node": "Contact",
    "Authorization Node / Protocol": "Authorization",
    "Rejected Node": "Rejected",
    "Target Entity ID": "Target ID",
    "Registry Protocol Type": "Type",
    "Active Protocols": "Active Pipelines",
    "Authorized Nodes": "Authorized Access",
    "Corporate Identity": "Company Name",
    "Primary Communication Node": "Email Address",
    "Registry Sector": "Sector",
    "Verified Node": "Verified",
    "Geographic Node": "Location",
    "Entity Identity": "Entity Name",
    "Logistics State": "Status",
    "Recipient Entity": "Recipient Name",
    "Closed Logic": "Closed",
    "Expected Logic Deployment": "Expected Date",
    "Client Entity": "Client Name",
    "Protocol Initialize": "Pending",
    "Draft Node": "Draft",
    "Scheduled Protocol": "Scheduled",
    "Completed Hub": "Completed",
    "Logic direction": "Direction",
    "Authorization Hub": "Authorization",
    "Contact Channel (Phone)": "Phone Number",
    "Communication Hub (Email)": "Email Address",
    "Registry Lead Name": "Lead Name",
    "Deal Matrix Identity": "Deal Title",
    "Projected Yield": "Amount",
    "Expected Close Date": "Close Date",
    "Legal Entity Name": "Contact Name",
    "Voice Channel": "Phone Number",
    "Associated Corporate Body": "Company Name",
    "Structural Role": "Job Title",
    "Geographic Hub": "City"
};

const sciFiWords = ["Registry", "Protocol", "Node", "Hub", "Matrix", "Entity", "Identity", "Architecture", "Logic", "State", "Velocity", "Temperature"];

let filesModified = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // We target label: "...", title: "...", title="..." 
    ['label:', 'title:', 'title=', 'subtitle='].forEach(prefix => {
        // Build regex. If prefix contains =, it is a prop in tsx. if :, it's object key
        const regexStr = prefix.replace(':', '\\s*:').replace('=', '\\s*=');
        const r = new RegExp(`(${regexStr}\\s*)"([^"]+)"`, 'g');
        content = content.replace(r, (match, prefixMatch, text) => {
            let newText = text;
            
            // Check exact map
            if (replacements[text]) {
                newText = replacements[text];
            } else {
                // Loop through weird terms and rip them out
                sciFiWords.forEach(w => {
                    // Match the word as a whole word boundary
                    const wr = new RegExp(`\\b${w}\\b`, 'gi');
                    newText = newText.replace(wr, '');
                });
                
                // If we stripped it to nothing, like "Matrix Protocol", and it's empty, revert it to prevent empty labels.
                newText = newText.replace(/\s{2,}/g, ' ').trim();
                newText = newText.replace(/^[\/\-_\s]+/, '').replace(/[\/\-_\s]+$/, '');
                
                if (newText === '') {
                    newText = "Data"; // Friendly fallback instead of blank
                }
            }

            return `${prefixMatch}"${newText}"`;
        });
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        filesModified++;
        console.log(`✔ Scrubbed terminology from: ${path.basename(file)}`);
    }
});

console.log(`\n🎉 Processed ${files.length} UI components. Scrubbed terminology in ${filesModified} files successfully!`);
