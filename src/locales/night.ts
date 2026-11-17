import type { Locale } from './types';

export const nightCopy = {
  pl: { discard: 'Rozpoczęcie innego zadania usunie niewysłaną odpowiedź i bieżące wskazówki. Kontynuować?', start: 'Rozpocznij ćwiczenie', resume: 'Kontynuuj ćwiczenie', choose: 'Zmień temat i poziom', current: 'Wybrane ćwiczenie', level: 'Poziom', chooseHelp: 'Wybierz temat poniżej lub zacznij od krótkiego zadania.' },
  en: { discard: 'Starting another task will discard your unsubmitted answer and current hints. Continue?', start: 'Start practice', resume: 'Continue practice', choose: 'Change topic and level', current: 'Selected exercise', level: 'Level', chooseHelp: 'Choose a topic below or start with a short exercise.' },
} satisfies Record<Locale, {discard:string;start:string;resume:string;choose:string;current:string;level:string;chooseHelp:string}>;
