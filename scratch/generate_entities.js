const fs = require('fs');
const path = require('path');

const schema = require('./enabler_schema.json');
const targetDir = path.join(__dirname, '..', 'src', 'database', 'enabler', 'entities');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function toPascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(/^[a-z]/, (m) => m.toUpperCase());
}

function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function mapMysqlTypeToTypeorm(mysqlType) {
  const lower = mysqlType.toLowerCase();
  if (lower.startsWith('int') || lower.startsWith('tinyint') || lower.startsWith('smallint') || lower.startsWith('mediumint')) {
    return { type: 'int', tsType: 'number' };
  }
  if (lower.startsWith('bigint')) {
    return { type: 'bigint', tsType: 'string' };
  }
  if (lower.startsWith('varchar')) {
    const len = lower.match(/\d+/)?.[0] || '255';
    return { type: `'varchar', length: ${len}`, tsType: 'string' };
  }
  if (lower === 'text' || lower.startsWith('mediumtext') || lower.startsWith('longtext')) {
    return { type: "'text'", tsType: 'string' };
  }
  if (lower.startsWith('decimal')) {
    return { type: `'decimal'`, tsType: 'string' };
  }
  if (lower === 'double' || lower === 'float') {
    return { type: `'${lower}'`, tsType: 'number' };
  }
  if (lower === 'datetime' || lower === 'timestamp') {
    return { type: `'datetime'`, tsType: 'Date' };
  }
  if (lower === 'date') {
    return { type: `'date'`, tsType: 'string' };
  }
  return { type: "'varchar', length: 255", tsType: 'string' };
}

const entityExports = [];

for (const [tableName, tableInfo] of Object.entries(schema)) {
  const className = `Enabler${toPascalCase(tableName)}`;
  const fileName = `${toKebabCase(tableName)}.entity.ts`;
  const filePath = path.join(targetDir, fileName);

  const columnsCode = [];
  const primaryKeys = tableInfo.primaryKeys || [];
  const autoInc = tableInfo.autoIncrement;

  // Determine PKs
  // If no PKs defined in SQL, choose a suitable PK or composite
  let effectivePKs = [...primaryKeys];
  if (effectivePKs.length === 0) {
    if (tableInfo.columns.some(c => c.name === 'no' || c.name === 'id')) {
      effectivePKs = [tableInfo.columns.find(c => c.name === 'no' || c.name === 'id').name];
    } else if (tableName === 'barcode_data') {
      effectivePKs = ['barcode'];
    } else if (tableName === 'totalizer') {
      effectivePKs = ['index_ip', 'index_pump', 'id_nozzle'];
    } else if (tableName === 'totalizer_history') {
      effectivePKs = ['index_pump', 'index_nozzle', 'id_shift'];
    } else if (tableName.startsWith('tank_table')) {
      effectivePKs = ['A'];
    } else {
      effectivePKs = [tableInfo.columns[0]?.name || 'id'];
    }
  }

  for (const col of tableInfo.columns) {
    const { type, tsType } = mapMysqlTypeToTypeorm(col.type);
    const isPK = effectivePKs.includes(col.name);
    const isAI = autoInc === col.name;
    const nullable = col.nullable;

    let decorator = '';
    if (isPK) {
      if (isAI) {
        decorator = `  @PrimaryGeneratedColumn({ name: '${col.name}' })\n  ${col.name}: ${tsType};`;
      } else {
        decorator = `  @PrimaryColumn({ name: '${col.name}' })\n  ${col.name}: ${tsType};`;
      }
    } else {
      const options = [`name: '${col.name}'`];
      if (type.startsWith("'")) {
        // type option is already in options
      }
      if (nullable) {
        options.push('nullable: true');
      }
      
      let typeArg = type;
      let extraOpts = options.filter(o => o !== `name: '${col.name}'`).join(', ');
      
      if (type.startsWith("'varchar'")) {
        decorator = `  @Column({ name: '${col.name}'${nullable ? ', nullable: true' : ''} })\n  ${col.name}: ${tsType};`;
      } else if (type === "'text'") {
        decorator = `  @Column('text', { name: '${col.name}'${nullable ? ', nullable: true' : ''} })\n  ${col.name}: ${tsType};`;
      } else if (type === "'datetime'") {
        decorator = `  @Column('datetime', { name: '${col.name}'${nullable ? ', nullable: true' : ''} })\n  ${col.name}: ${tsType};`;
      } else if (type === "'decimal'" || type === "'double'" || type === "'float'") {
        decorator = `  @Column(${type}, { name: '${col.name}'${nullable ? ', nullable: true' : ''} })\n  ${col.name}: ${tsType};`;
      } else {
        decorator = `  @Column({ name: '${col.name}'${nullable ? ', nullable: true' : ''} })\n  ${col.name}: ${tsType};`;
      }
    }
    columnsCode.push(decorator);
  }

  const imports = ['Entity', 'Column'];
  if (tableInfo.columns.some(c => effectivePKs.includes(c.name) && autoInc === c.name)) {
    imports.push('PrimaryGeneratedColumn');
  }
  if (tableInfo.columns.some(c => effectivePKs.includes(c.name) && autoInc !== c.name)) {
    imports.push('PrimaryColumn');
  }

  const fileContent = `import { ${imports.join(', ')} } from 'typeorm';

@Entity('${tableName}')
export class ${className} {
${columnsCode.join('\n\n')}
}
`;

  fs.writeFileSync(filePath, fileContent, 'utf8');
  entityExports.push({ className, fileName: toKebabCase(tableName) });
}

// Generate index.ts
const indexContent = entityExports
  .map(e => `export * from './${e.fileName}.entity';`)
  .join('\n') + '\n';

fs.writeFileSync(path.join(targetDir, 'index.ts'), indexContent, 'utf8');

// Generate enabler-entities.ts list
const enablerEntitiesList = `import {
  ${entityExports.map(e => e.className).join(',\n  ')},
} from './entities';

export const enablerEntities = [
  ${entityExports.map(e => e.className).join(',\n  ')},
];
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'database', 'enabler', 'enabler-entities.ts'), enablerEntitiesList, 'utf8');

console.log(`Generated ${entityExports.length} entities and barrel exports successfully!`);
