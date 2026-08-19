const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(path.join(__dirname, '..', 'enablerujb.sql'), 'utf8');

// Also look for ALTER TABLE ... ADD PRIMARY KEY
const primaryKeys = {};
const pkMatches = sql.matchAll(/ALTER TABLE `([^`]+)`\s+ADD PRIMARY KEY \(([^)]+)\);/g);
for (const m of pkMatches) {
  primaryKeys[m[1]] = m[2].split(',').map(s => s.trim().replace(/`/g, ''));
}

// AUTO_INCREMENT
const autoIncrements = {};
const aiMatches = sql.matchAll(/ALTER TABLE `([^`]+)`\s+MODIFY `([^`]+)` [^;]*AUTO_INCREMENT[^;]*;/g);
for (const m of aiMatches) {
  autoIncrements[m[1]] = m[2];
}

const tableMatches = sql.matchAll(/CREATE TABLE `([^`]+)` \(([\s\S]*?)\) ENGINE=/g);
const result = {};

for (const match of tableMatches) {
  const tableName = match[1];
  const body = match[2];
  const columns = [];
  
  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    const colMatch = trimmed.match(/^`([^`]+)`\s+(int\(\d+\)|varchar\(\d+\)|text|datetime|date|double|float|decimal\([^)]+\)|timestamp|tinyint\(\d+\)|bigint\(\d+\)|smallint\(\d+\))(?:\s+(NOT NULL|NULL))?(?:\s+DEFAULT\s+([^,]+))?/i);
    if (colMatch) {
      columns.push({
        name: colMatch[1],
        type: colMatch[2],
        nullable: colMatch[3] !== 'NOT NULL',
        defaultValue: colMatch[4] || null,
        isPrimary: primaryKeys[tableName]?.includes(colMatch[1]) || false,
        isAutoIncrement: autoIncrements[tableName] === colMatch[1]
      });
    }
  }
  result[tableName] = {
    tableName,
    primaryKeys: primaryKeys[tableName] || [],
    autoIncrement: autoIncrements[tableName] || null,
    columns
  };
}

fs.writeFileSync(path.join(__dirname, 'enabler_schema.json'), JSON.stringify(result, null, 2), 'utf8');
console.log(`Saved ${Object.keys(result).length} tables to enabler_schema.json`);
