// node specs/report.mjs <feature> [notes.md]
// Writes specs/<feature>/test-report.md from test-results.json. Extra notes are appended as written.
import fs from 'node:fs'
const [feature, notesFile] = process.argv.slice(2)
const r = JSON.parse(fs.readFileSync(`specs/${feature}/test-results.json`, 'utf8'))
const cell = (s) => String(s).replace(/\|/g, '/').replace(/\n/g, ' ')
const pass = r.results.filter((x) => x.result === 'Pass').length
let md = `# Test report: ${feature}\n\n`
md += `- Date: ${r.date}\n- Commit tested: ${r.commit}\n- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch\n- Target: ${r.base}\n- Result: ${pass} of ${r.results.length} criteria pass\n\n`
md += `| # | Criterion | Result | Notes | Screenshot |\n|---|---|---|---|---|\n`
for (const x of r.results) md += `| ${x.n} | ${cell(x.text)} | ${x.result} | ${cell(x.notes)} | [ac-${x.n}](screenshots/ac-${x.n}.png) |\n`
md += `\n## Console errors\n\n${r.consoleErrors.length ? r.consoleErrors.map((e) => `- ${cell(e)}`).join('\n') : 'None.'}\n`
if (notesFile) md += '\n' + fs.readFileSync(notesFile, 'utf8')
fs.writeFileSync(`specs/${feature}/test-report.md`, md)
console.log(`wrote specs/${feature}/test-report.md`)
