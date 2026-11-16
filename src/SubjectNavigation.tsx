import type { Locale } from "./locales/types";
import { subjectCopy, subjectOrder, subjectStatus, type PlannedSubjectId, type SubjectId } from "./subjectRoadmap";

type NavigationProps = {
  locale: Locale;
  subject: SubjectId;
  onSelect: (subject: SubjectId) => void;
  disabled?: boolean;
};

export function SubjectNavigation({ locale, subject, onSelect, disabled = false }: NavigationProps) {
  const copy = subjectCopy[locale];
  return (
    <nav className="subject-navigation" aria-label={copy.navigation}>
      {subjectOrder.map((id) => (
        <button
          key={id}
          type="button"
          disabled={disabled}
          aria-current={subject === id ? "page" : undefined}
          onClick={() => onSelect(id)}
        >
          <span className="subject-nav-label">{copy.subjects[id].label}</span>
          <span className={`subject-status subject-status--${subjectStatus[id]}`}>
            {copy.status[subjectStatus[id]]}
          </span>
        </button>
      ))}
    </nav>
  );
}

export function PlannedSubjectPanel({ locale, subject }: { locale: Locale; subject: PlannedSubjectId }) {
  const copy = subjectCopy[locale];
  const details = copy.subjects[subject];
  return (
    <section className="subject-roadmap-panel" aria-labelledby="subject-roadmap-title">
      <div className="subject-roadmap-inner">
        <p className="subject-roadmap-eyebrow">{copy.eyebrow}</p>
        <span className={`subject-status subject-status--${subjectStatus[subject]}`}>
          {copy.status[subjectStatus[subject]]}
        </span>
        <h1 id="subject-roadmap-title">{details.title}</h1>
        <p className="subject-roadmap-description">{details.description}</p>
        <h2>{copy.topicsHeading}</h2>
        <ul className="subject-topic-list">
          {details.topics.map((topic) => <li key={topic}>{topic}</li>)}
        </ul>
        <h2>{copy.nextHeading}</h2>
        <p>{details.nextStep}</p>
        <p className="subject-roadmap-disclaimer">{copy.disclaimer}</p>
        <a className="subject-roadmap-link" href="https://github.com/eluyz/math-tutor-app/blob/main/docs/SUBJECT_EXPANSION_PLAN.md" target="_blank" rel="noopener noreferrer">
          {copy.roadmapLink} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
