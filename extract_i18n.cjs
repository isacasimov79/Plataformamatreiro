const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app', 'pages');
const localesDir = path.join(__dirname, 'src', 'i18n', 'locales');

// Arquivos pra analisar
const filesToAnalyze = [
  'Reports.tsx',
  'GamificationPage.tsx',
  'Tenants.tsx',
  'Automations.tsx',
  'SystemUsers.tsx',
  'Permissions.tsx',
  'Integrations.tsx',
  'AuditLogs.tsx',
  'Settings.tsx',
  'AdvancedDashboard.tsx',
  'Notifications.tsx',
  'Debug.tsx'
];

function extractKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const tRegex = /(?:t|i18next\.t)\(['"]([^'"]+)['"](?:.*?)?\)/g;
  const keys = new Set();
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  return Array.from(keys);
}

function addToJson(jsonPath, newKeys) {
  let data = {};
  if (fs.existsSync(jsonPath)) {
    data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
  
  let added = 0;
  
  for (const keyPath of newKeys) {
    const parts = keyPath.split('.');
    let current = data;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        if (typeof current[part] !== 'string') {
          // Extrai default word
          const lastPart = parts[parts.length - 1];
          // Title case 
          let def = lastPart.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          current[part] = def;
          added++;
        }
      } else {
        if (typeof current[part] !== 'object') {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }
  
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log(`[${path.basename(jsonPath)}] Added ${added} new keys.`);
}

let allKeys = [];
filesToAnalyze.forEach(file => {
  const p = path.join(srcDir, file);
  if (fs.existsSync(p)) {
    console.log(`Extracting from ${file}...`);
    allKeys = allKeys.concat(extractKeys(p));
  }
});

// Remove duplicates
allKeys = [...new Set(allKeys)];
console.log(`Found ${allKeys.length} distinct keys.`);

const locales = ['en.json', 'es.json', 'pt-BR.json'];
locales.forEach(loc => {
  addToJson(path.join(localesDir, loc), allKeys);
});
