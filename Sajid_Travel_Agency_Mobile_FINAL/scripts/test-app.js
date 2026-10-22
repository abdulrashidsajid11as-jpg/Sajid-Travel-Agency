const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const htmlPath = 'app/src/main/assets/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');
const start = html.indexOf('function validateBackupTable(');
const end = html.indexOf('function importBackup(', start);
if (start < 0 || end < 0) throw new Error('validateBackupTable function not found');
const fnLine = html.slice(start, end).trim();
const context = {};
vm.createContext(context);
vm.runInContext(fnLine + '\nthis.validateBackupTable = validateBackupTable;', context);
const validate = context.validateBackupTable;
const tests = [
  ['valid customer table', 'customers', [{id:1,name:'Ahmad',phone:'0700',passport:'P1'}], true],
  ['reject customer without name', 'customers', [{id:1,name:'  '}], false],
  ['valid ticket', 'tickets', [{id:1,t_name:'Ahmad',t_route:'KBL-DXB',t_amount:100}], true],
  ['reject ticket without route', 'tickets', [{id:1,t_name:'Ahmad',t_route:''}], false],
  ['reject negative ticket amount', 'tickets', [{id:1,t_name:'Ahmad',t_route:'KBL-DXB',t_amount:-1}], false],
  ['valid visa', 'visas', [{id:1,v_name:'Ahmad',v_country:'UAE'}], true],
  ['reject visa without country', 'visas', [{id:1,v_name:'Ahmad',v_country:''}], false],
  ['valid payment', 'payments', [{id:1,p_name:'Ahmad',p_amount:50}], true],
  ['reject negative payment', 'payments', [{id:1,p_name:'Ahmad',p_amount:-50}], false],
  ['valid expense', 'expenses', [{id:1,e_title:'Rent',e_amount:10}], true],
  ['reject expense without title', 'expenses', [{id:1,e_title:'',e_amount:10}], false],
  ['reject duplicate IDs', 'customers', [{id:1,name:'A'},{id:1,name:'B'}], false],
  ['reject object value', 'customers', [{id:1,name:'A',phone:{bad:true}}], false],
  ['reject non-array table', 'customers', {id:1,name:'A'}, false],
  ['allow empty array', 'customers', [], true],
];
for (const [name, table, rows, expected] of tests) {
  const actual = validate(table, rows);
  assert.strictEqual(actual, expected, name);
  console.log(`PASS: ${name}`);
}
const metadataStart = html.indexOf('function validateBackupMetadata(');
const metadataEnd = html.indexOf('function importBackup(', metadataStart);
if (metadataStart < 0 || metadataEnd < 0) throw new Error('validateBackupMetadata function not found');
const metadataContext = {};
vm.createContext(metadataContext);
vm.runInContext(html.slice(metadataStart, metadataEnd) + '\nthis.validateBackupMetadata = validateBackupMetadata;', metadataContext);
const validateMetadata = metadataContext.validateBackupMetadata;
assert.strictEqual(validateMetadata({recordCounts:{customers:1},exportedAt:'2026-10-22T00:00:00.000Z'},{customers:[{name:'A'}]},['customers']), true, 'valid backup metadata');
assert.strictEqual(validateMetadata({recordCounts:{customers:2}},{customers:[{name:'A'}]},['customers']), false, 'reject incorrect record count');
assert.strictEqual(validateMetadata({recordCounts:{customers:-1}},{customers:[]},['customers']), false, 'reject negative record count');
assert.strictEqual(validateMetadata({exportedAt:'not-a-date'},{customers:[]},['customers']), false, 'reject invalid export date');
console.log('PASS: backup metadata counts and timestamp validation');
const gradle = fs.readFileSync('app/build.gradle', 'utf8');
const versionMatch = gradle.match(/versionCode\s+(\d+)/);
if (!versionMatch) throw new Error('versionCode not found');
const version = Number(versionMatch[1]);
assert.match(gradle, new RegExp(`versionName\\s+'${version}\\.0'`));
assert.match(html, new RegExp(`APP_VERSION='${version}\\.0'`));
assert.match(html, new RegExp(`Mobile v${version}`));
assert.match(html, new RegExp(`schemaVersion:${version}`));
assert.match(html, new RegExp(`obj\\.schemaVersion>${version}`));
assert.match(html, /function save\(key,a\)\{try\{[\s\S]*?storageGet\(key\)!==encoded[\s\S]*?return true[\s\S]*?return false\}\}/);
assert.match(html, /function printReport\(\)\{[\s\S]*?window\.print\(\)/);
assert.match(html, /راپور چاپ \/ Print report/);
assert.match(html, /function clearReportDates\(\)/);
assert.match(html, /function renderReports\(\)[\s\S]*?report_from[\s\S]*?report_to/);
assert.match(html, /راپور وښایه \/ Apply date filter/);
assert.match(html, /ټولې نېټې \/ All dates/);
assert.match(html, /function updateDashboard\(\)[\s\S]*?Upcoming trips[\s\S]*?Payments total[\s\S]*?Expenses total/);
assert.match(html, /function localDateISO\(date=new Date\(\)\)/);
assert.match(html, /const today=localDateISO\(\)/);
assert.match(html, /rollbackFailed/);
assert.match(html, /obj\.schemaVersion>58/);
assert.match(html, /id="dashboard_stats"/);
assert.match(html, /function collectDataQualityIssues\(tables\)/);
assert.match(html, /function runDataQualityCheck\(\)/);
assert.match(html, /function exportQualityCsv\(\)/);
assert.match(html, /Data Quality Check/);
const auditMatch = html.match(/function collectDataQualityIssues\(tables\)\{[\s\S]*?\n\}/);
if (!auditMatch) throw new Error('collectDataQualityIssues function not found');
const auditContext = { TABLES: ['customers','tickets','visas','payments','expenses'] };
vm.createContext(auditContext);
vm.runInContext(auditMatch[0] + '\nthis.collectDataQualityIssues = collectDataQualityIssues;', auditContext);
const audit = auditContext.collectDataQualityIssues;
const auditClean = audit({customers:[{name:'Ahmad',phone:'0700',passport:'P1'}],tickets:[{t_name:'Ahmad',t_route:'KBL-DXB',t_date:'2026-11-01',t_no:'T1',t_amount:100}],visas:[{v_name:'Ahmad',v_country:'UAE',v_date:'2026-10-20'}],payments:[{p_name:'Ahmad',p_amount:10,p_date:'2026-10-20'}],expenses:[{e_title:'Rent',e_amount:5,e_date:'2026-10-20'}]});
assert.strictEqual(auditClean.length, 0, 'clean data should have no audit issues');
const auditBad = audit({customers:[{name:'Ahmad',phone:'0700',passport:'P1'},{name:'Sara',phone:'0700',passport:'P1'}],tickets:[{t_name:'',t_route:'',t_amount:-3,t_no:'T1'},{t_name:'Ali',t_route:'DXB-KBL',t_no:'T1'}],visas:[],payments:[],expenses:[]});
assert.ok(auditBad.length >= 6, 'audit should find missing fields, duplicates, invalid amount and missing date');
console.log('PASS: data quality audit detects invalid and duplicate records');
assert.match(html, /if\(id==='home'\)updateDashboard\(\)/);
console.log('PASS: persisted-write verification helper');
console.log('PASS: printable reports button and print handler');
console.log(`PASS: Gradle, visible header, APP_VERSION, and backup schema version match ${version}`);
console.log(`All ${tests.length + 7} regression checks passed.`);
