// "Shape Your Club" — one-click voting from the monthly email.
//
// Each option is its own link, so a vote costs a single tap. The question a
// contact sees is chosen by their membership interest, so the options below are
// grouped the same way.

export type Question = 'lifestyle' | 'fitness' | 'wellness'

export const QUESTIONS: Record<Question, { prompt: string; options: Record<string, string> }> = {
  lifestyle: {
    prompt: 'Which should open first?',
    options: {
      recovery:   'The Recovery Centre',
      pool:       'The pool',
      pickleball: 'The pickleball courts',
    },
  },
  fitness: {
    prompt: 'What gets you in the door?',
    options: {
      strength: 'Heavy strength',
      classes:  'A great class timetable',
      both:     'Both, equally',
    },
  },
  wellness: {
    prompt: 'What matters most to you?',
    options: {
      recovery: 'Recovery',
      mobility: 'Mobility',
      guided:   'Guided strength',
    },
  },
}

export function isValidVote(q?: string | null, a?: string | null): q is Question {
  if (!q || !a) return false
  const question = QUESTIONS[q as Question]
  return !!question && a in question.options
}

export function answerLabel(q: Question, a: string): string {
  return QUESTIONS[q].options[a] ?? a
}
