// Quiz level for the home tile. Reads the progress saved by the quiz on this device.
export const LEVELS = ['Beginner', 'Learner', 'Advocate'] as const
export const ROUND_SIZE = 6
export const PASS = 4

export type QuizProgress = { best: Record<string, number>; level: string | null }

// 0 to 3. Each passed round is one whole step. The best score in the next round adds part of a step.
export function progress(q: QuizProgress): number {
  let steps = 0
  for (const l of LEVELS) {
    const best = q.best[l] ?? 0
    if (best >= PASS) {
      steps += 1
      continue
    }
    steps += Math.min(best, PASS) / PASS
    break
  }
  return Math.min(steps, LEVELS.length)
}

export function levelsToGo(q: QuizProgress): number {
  return LEVELS.length - (q.level ? LEVELS.indexOf(q.level as (typeof LEVELS)[number]) + 1 : 0)
}
