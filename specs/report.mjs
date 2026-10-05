// node specs/report.mjs <feature> [notes.md]
// Writes specs/<feature>/test-report.md from test-results.json. Extra notes are appended as written.
// Without a notes file, the written notes of the existing report (everything after the console errors) are kept.
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
const reportPath = `specs/${feature}/test-report.md`
let notes = notesFile ? fs.readFileSync(notesFile, 'utf8') : ''
if (!notesFile && fs.existsSync(reportPath)) {
  const old = fs.readFileSync(reportPath, 'utf8')
  const at = old.indexOf('\n## Console errors')
  const next = at >= 0 ? old.indexOf('\n## ', at + 5) : -1
  if (next >= 0) notes = old.slice(next + 1)
}
if (notes) md += '\n' + notes
fs.writeFileSync(reportPath, md)
console.log(`wrote specs/${feature}/test-report.md`)
