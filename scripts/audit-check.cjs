const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const exceptions = require('./audit-exceptions.json');
const result = spawnSync(process.execPath, [process.env.npm_execpath, 'audit', '--json'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
if (result.error) throw result.error;
const audit = JSON.parse(result.stdout);
fs.writeFileSync('audit.json', JSON.stringify(audit, null, 2));
if (audit.error || !audit.metadata) throw new Error('Dependency audit could not be completed');
const approved = new Set(exceptions.advisories.map(item => item.source));
const active = new Date() <= new Date(`${exceptions.expires}T23:59:59Z`);
const unexpected = [];
for (const entry of Object.values(audit.vulnerabilities || {})) {
  for (const advisory of entry.via) {
    if (typeof advisory === 'object' && ['high', 'critical'].includes(advisory.severity) && (!active || !approved.has(advisory.source))) unexpected.push(advisory.url);
  }
}
console.log(JSON.stringify({ vulnerabilities: audit.metadata.vulnerabilities, toolingExceptionsExpire: exceptions.expires, unexpected: [...new Set(unexpected)] }));
if (unexpected.length) process.exitCode = 1;
