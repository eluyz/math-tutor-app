import { describe, expect, it } from 'vitest'
import { checkAnswer } from './exercises'
import { exercises, feedback } from './locales/pl'

describe('sprawdzanie przykładowych zadań', () => {
  it.each([
    ['kolejność działań', 0, '11', '14', 'Mnożenie ma pierwszeństwo'],
    ['liczby ujemne', 1, '5', '-19', 'przesuwa wynik w prawo'],
    ['podstawowa algebra', 2, '4', '8', 'To wartość 2x'],
  ])('%s: poprawna odpowiedź, typowy błąd i wyjaśnienie', (_name, index, correct, mistake, explanation) => {
    const exercise = exercises[index as number]
    expect(checkAnswer(exercise, correct as string, feedback)).toEqual({ kind: 'correct', message: `Dobrze! ${exercise.explanation}` })
    expect(checkAnswer(exercise, mistake as string, feedback)).toMatchObject({ kind: 'incorrect' })
    expect(checkAnswer(exercise, mistake as string, feedback).message).toContain(explanation)
  })

  it('akceptuje białe znaki i polski separator dziesiętny', () => {
    expect(checkAnswer(exercises[0], ' 11,0 ', feedback)).toMatchObject({ kind: 'correct' })
  })

  it('nie interpretuje wyrażeń ani pustej odpowiedzi jako liczby', () => {
    for (const answer of ['', '3+8', 'Infinity', '11abc']) {
      expect(checkAnswer(exercises[0], answer, feedback)).toMatchObject({ kind: 'invalid' })
    }
  })

  it('daje wskazówkę dla innych błędnych odpowiedzi', () => {
    expect(checkAnswer(exercises[2], '9', feedback).message).toContain(exercises[2].hint)
  })
})
