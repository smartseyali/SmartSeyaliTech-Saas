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

const sciFiWords = ["Registry", "Protocol", "Node", "Hub", "Matrix", "Entity", "Identity", "Architecture", "Logic", "Yield", "Velocity", "Temperature"];

const replacements = {
    "Target Entity ID": "Target ID",
    "Verified Node": "Verified",
    "System Resource Node": "System User",
    "Terminal Node Alpha": "Terminal Alpha",
    "Matrix Billing": "Billing",
    "Matrix Total Yield": "Total Amount",
    "Logistics Protocol": "Logistics",
    "Anonymous Node": "Anonymous",
    "Anonymous Entity": "Anonymous",
    "Corporate Hub": "Corporate",
    "Online Matrix": "Online",
    "System Generated Protocol Entry": "System Generated Entry",
    "Induction Contact / Node": "Contact", 
    "Authorization Node / Protocol": "Authorization",
    "Matrix Stage": "Stage",
    "Protocol initialize": "Initialize"
};

let filesModified = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    const regex = /(['">])([^<>'"]*(?:Registry|Protocol|Node|Hub|Matrix|Entity|Identity|Architecture|Logic|Yield|Velocity|Temperature)[^<>'"]*)(['"<])/gi;

    content = content.replace(regex, (match, prefix, text, suffix) => {
        let newText = text;
        
        let textTrimmed = text.trim();
        if (replacements[textTrimmed]) {
            newText = newText.replace(textTrimmed, replacements[textTrimmed]);
        } else {
            sciFiWords.forEach(w => {
                const wr = new RegExp(`\\b${w}s?\\b`, 'gi'); // handles plural
                newText = newText.replace(wr, '');
            });
            
            newText = newText.replace(/\s{2,}/g, ' ').trim();
            newText = newText.replace(/^[\/\-_\s]+/, '').replace(/[\/\-_\s]+$/, '');
            
            if (newText === '') {
                newText = "Data";
            }
        }

        return `${prefix}${newText}${suffix}`;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        filesModified++;
        console.log(`Cleaned inline strings in: ${path.basename(file)}`);
    }
});

console.log(`\nProcessed inline UI components. Stripped inline text in ${filesModified} files.`);
