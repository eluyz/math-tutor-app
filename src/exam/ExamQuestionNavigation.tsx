import type { examCopy } from "./copy";

export function ExamQuestionNavigation({ answerPresence, currentIndex, copy, onSelect }: {
  answerPresence: readonly boolean[];
  currentIndex: number;
  copy: Pick<typeof examCopy.pl, "review" | "question" | "answerEntered" | "noAnswer">;
  onSelect: (index: number) => void;
}) {
  return <nav className="exam-question-nav" aria-label={copy.review}>
    {answerPresence.map((answered, index) => <button type="button" key={index}
      aria-current={currentIndex === index ? "step" : undefined}
      aria-label={`${copy.question(index + 1, answerPresence.length)}: ${answered ? copy.answerEntered : copy.noAnswer}`}
      className={answered ? "answered" : ""} onClick={() => onSelect(index)}>
      <span className="exam-question-number">{index + 1}</span>
      <span className="exam-answer-state">{answered ? copy.answerEntered : copy.noAnswer}</span>
    </button>)}
  </nav>;
}
