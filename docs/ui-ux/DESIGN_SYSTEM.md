# MT-UI-001 — design system

[View both visual concepts](screenshots/concepts.png) · [HTML version](CONCEPTS.html).

## Two concepts

| Direction | Character | Benefits | Cost / tradeoff |
| --- | --- | --- | --- |
| Focus Studio (recommended) | White surfaces, cool grays, emerald, system sans-serif | Quick catalog scanning, a calm exercise workspace, good information density | Less editorial character |
| Editorial Academy | Paper background, ink and terracotta, serif headings | Warm, book-like character | Serif names take longer to scan in a dense catalog |

Designer’s choice: Focus Studio. The user authorized selecting the recommendation and implementing a limited prototype. The prototype will require approval before extending the design to other screens.

## Tokens and rules

- Background #f5f7f8, surface #ffffff, text #172b35, secondary text #52636d.
- Accent #17634b, selected state #e8f3ed, control border #7d8d96.
- Focus #245ec7, 3 px outline with a 3 px offset; the sticky header must not obscure it.
- System sans-serif without font downloads. Body 16 px / 1.6; headings 24–44 px; formulas Georgia/Cambria Math, preserving existing rendering.
- Spacing scale 4/8/12/16/24/32/48 px. Maximum container width 1280 px; side margins 16 px on mobile, 32 px on desktop.
- Corner radii 8 px for controls, 16 px for main cards; one subtle shadow. No gradients.
- Buttons at least 44 px high, with 8 px gaps; equal columns and wrapping labels on mobile. Selection is also indicated by text weight and borders, with aria-pressed/current semantics.
- Mathematical symbols and arrows remain simple and decorative; no new icon library.
- Catalog and exercise screen: one column on phones, two from 900 px. Long formulas/tables may scroll within their own regions, never across the entire document.
- The redesign is limited to the header, navigation, and learning workspace. The shared exercise renderer receives styling, so it also covers other exercise families without changing their content or logic. Statistics, roadmaps, progress, exam, scratchpad, and solutions retain their components and detailed styles. The shared base font, background, and shell width/margins also affect their surroundings. Shared navigation includes all four subjects, with statuses unchanged.

## Accessibility

WCAG 2.2 AA is the target for the modified interface: text contrast of at least 4.5:1, control contrast of 3:1, visible focus, labels, keyboard access, a skip link, reflow, and reduced motion support. This is not a certification claim for the whole application. Native buttons and existing status messages remain the basis of interaction.

## Sources and how they were used

No local UI UX Pro Max / Impeccable / Vercel skills were found during MT-UI-001. Nothing was installed and no external scripts were run.

- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md): accessibility, touch, responsiveness, and semantic tokens were prioritized; public documentation was used without running the generator.
- [Impeccable](https://github.com/pbakaus/impeccable): limited scope, hierarchy critique, typography, and resilience to long content; no installer or hooks.
- [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md): skip link, focus, reduced motion, labels, and reflow.
- [Mobbin](https://mobbin.com): the public page presents screen and end-to-end flow patterns; used as a reference for consistent hierarchy and navigation. No paid library was accessed and no screens were copied.
- Khan Academy / Brilliant: general inspiration for a focus on learning; no copying of brand identity.

## Token contrast checks

Calculated using relative sRGB luminance: text on white 14,65:1; secondary text on the application background 5,81:1; accent on white 7,18:1; accent on the selected-state background 6,32:1; focus on white 6,00:1; control outline on white 3,43:1. These checks cover the specified token pairs, rather than automatically auditing every state in the application.


## MT-UI-003 — Focus Studio refinements

The active exercise precedes configuration in the DOM and mobile layout. Quick
start beside the title moves focus to the exercise content without immediately
opening the keyboard. The native topic/level picker is collapsible and open by
default for discoverability. The remaining exercise-family list is secondary to
the exercise.

Shared learning classes and tokens now also cover the Statistics pilot; detailed
progress and exam styles have been aligned without changing their models. Exam
counters and states distinguish an entered answer from an empty one, never
revealing correctness before submission. Forms are linked to a persistent
feedback region; errors are not conveyed by color alone.

The logo and view switching preserve work in memory. Changing the exercise warns
when it would replace an unsubmitted answer or notes subject to auto-clear.
Reloading still loses work after the user knowingly accepts the native browser
warning. No new data store was introduced.

Footer: muted text on the background has a calculated contrast of 5,81:1. Long
formulas have local scrolling; new screenshots and actual behavior at
320–1440/PL–EN require verification in a browser with a working sandbox. Older
screenshots are not evidence of the current appearance. Detailed results:
MT_UI_003_NIGHT_LOG.md.
