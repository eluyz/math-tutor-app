import type { Locale } from './types';

export const nightCopy = {
  pl: { discard: 'Zmiana zadania lub zakończenie ćwiczenia usunie bieżącą odpowiedź i wskazówki. Wpisana odpowiedź nie zostanie automatycznie oceniona. Dotychczasowe wyniki sesji zostaną zachowane. Notatki zostaną wyczyszczone tylko przy włączonym automatycznym czyszczeniu. Kontynuować?', start: 'Rozpocznij ćwiczenie', resume: 'Kontynuuj ćwiczenie', choose: 'Zmień temat i poziom', current: 'Wybrane ćwiczenie', level: 'Poziom', chooseHelp: 'Wybierz temat poniżej lub zacznij od krótkiego zadania.' },
  en: { discard: 'Changing tasks or finishing practice clears the current answer and hints. The entered answer will not be assessed automatically. Existing session results are kept. Notes are cleared only when automatic clearing is enabled. Continue?', start: 'Start practice', resume: 'Continue practice', choose: 'Change topic and level', current: 'Selected exercise', level: 'Level', chooseHelp: 'Choose a topic below or start with a short exercise.' },
} satisfies Record<Locale, {discard:string;start:string;resume:string;choose:string;current:string;level:string;chooseHelp:string}>;
