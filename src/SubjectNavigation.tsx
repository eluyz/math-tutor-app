import type { Locale } from "./locales/types";
import { PracticeSelectorPanel } from "./ui/PracticeSelectorPanel";
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
  const status = copy.status[subjectStatus[subject]];
  return (
    <section className="planned-practice learning-workspace subject-roadmap-panel" aria-labelledby="subject-roadmap-title">
      <div className="section-heading">
        <div>
          <p className="subject-roadmap-eyebrow">{copy.eyebrow}</p>
          <span className={`subject-status subject-status--${subjectStatus[subject]}`}>{status}</span>
          <h1 id="subject-roadmap-title">{details.title}</h1>
        </div>
        <p className="subject-roadmap-description">{details.description}</p>
      </div>
      <div className="exercise-panel planned-subject-card">
        <div className="panel-top"><span>{status}</span><span aria-hidden="true">∑</span></div>
        <h2>{copy.nextHeading}</h2>
        <p>{details.nextStep}</p>
        <p className="subject-roadmap-disclaimer">{copy.disclaimer}</p>
      </div>
      <PracticeSelectorPanel title={copy.topicsHeading} context={details.title}>
        <ul className="subject-topic-list">
          {details.topics.map((topic) => <li key={topic}>{topic}</li>)}
        </ul>
        <a className="subject-roadmap-link" href="https://github.com/eluyz/math-tutor-app/blob/main/docs/SUBJECT_EXPANSION_PLAN.md" target="_blank" rel="noopener noreferrer">
          {copy.roadmapLink} <span aria-hidden="true">↗</span>
        </a>
      </PracticeSelectorPanel>
    </section>
  );
}
