// Fails the build if quiz.json drifts from IFANCA's FAQ text.
// Every question must link a FAQ in faqs.json and quote a sentence that is in that answer word for word.
import fs from 'node:fs'
import path from 'node:path'

const dir = path.join(path.dirname(path.dirname(new URL(import.meta.url).pathname)), 'public', 'data')
const quizFile = process.argv[2] || path.join(dir, 'quiz.json')
const faqs = JSON.parse(fs.readFileSync(path.join(dir, 'faqs.json'), 'utf8')).items
const quiz = JSON.parse(fs.readFileSync(quizFile, 'utf8'))
const byUrl = new Map(faqs.map((f) => [f.url, f]))
const levels = ['Beginner', 'Learner', 'Advocate']
const errors = []

if (quiz.items.length < 15 || quiz.items.length > 20) errors.push(`${quiz.items.length} questions, expected 15 to 20`)
if (quiz.count !== quiz.items.length) errors.push('count does not match items')
const ids = new Set()
for (const q of quiz.items) {
  const where = `${q.id}:`
  if (ids.has(q.id)) errors.push(`${where} duplicate id`)
  ids.add(q.id)
  if (!levels.includes(q.level)) errors.push(`${where} unknown level ${q.level}`)
  const faq = byUrl.get(q.faq_url)
  if (!faq) errors.push(`${where} faq_url not in faqs.json`)
  else {
    if (!faq.answer.includes(q.source_quote)) errors.push(`${where} source_quote is not word for word in the FAQ answer`)
    if (faq.question !== q.faq_question) errors.push(`${where} faq_question does not match`)
  }
  if (!Array.isArray(q.options) || q.options.length < 3 || q.options.length > 4) errors.push(`${where} needs 3 or 4 options`)
  if (!(q.answer >= 0 && q.answer < q.options.length)) errors.push(`${where} answer index out of range`)
}
for (const l of levels) {
  const n = quiz.items.filter((q) => q.level === l).length
  if (n < 5) errors.push(`${l} has ${n} questions, expected at least 5`)
}

if (errors.length) {
  console.error(`quiz.json check failed:\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log(`quiz.json ok: ${quiz.items.length} questions, every quote found in its FAQ answer`)
