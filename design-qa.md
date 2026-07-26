# OPCWISE Design QA

- Source visual truth: `C:\Users\PC\.codex\attachments\ac44d72d-6c09-40c7-97aa-a95012f70646\image-1.jpg`
- Final implementation screenshot: `C:\Users\PC\Documents\Codex\2026-07-24\yeah\outputs\opcwise-website\implementation-desktop-final.png`
- Combined comparison evidence: `C:\Users\PC\Documents\Codex\2026-07-24\yeah\outputs\opcwise-website\design-comparison-final.png`
- Mobile evidence: `C:\Users\PC\Documents\Codex\2026-07-24\yeah\outputs\opcwise-website\implementation-mobile-v2.png`
- Desktop viewport: 1680 × 944 CSS px, device scale factor 1
- Source pixels: 1680 × 944
- Implementation pixels: 1680 × 944
- Density normalization: none required; source and implementation were compared at identical pixel and CSS dimensions
- Mobile viewport: 390 × 844 CSS px; 375 px layout viewport after scrollbar reservation
- State: desktop homepage default state; mobile homepage default state and open navigation state

## Full-view comparison evidence

The final side-by-side comparison shows the same overall composition as the source: dark navy frame, wide header, left-aligned two-line hero title, right-side conference stage, two principal action buttons, a four-column metric band, and paired “大会亮点 / 精彩瞬间” panels beginning at the same above-the-fold depth.

The source brand mark, conference-stage image, and six event thumbnails are present as real raster assets. The supplied Illustrator artwork was used to preserve the mark geometry while removing the “JUELING” wordmark. No placeholder imagery, custom SVG artwork, CSS illustration, or emoji substitution is present.

## Focused region comparison evidence

Focused inspection was completed for:

- Header and brand lockup: mark scale, wordmark hierarchy, active navigation state, and CTA placement.
- Hero: title scale and wrapping, copy width, audience line, button sizing, stage crop, and vertical transition into the metric band.
- Lower first viewport: metric dividers, icon alignment, panel radii, heading markers, highlight grid, and six-image event grid.
- Forms: desktop dialog hierarchy, field labels, option states, file/link areas, validation errors, and success state.
- Mobile: header/menu, title wrapping, two first-screen action buttons, stage image, horizontal overflow, and choice dialog fit.

## Required fidelity surfaces

### Fonts and typography

Noto Sans SC is used for Chinese UI text and Space Grotesk for the OPCWISE/Latin display treatment. Display hierarchy, weights, line heights, and wrapping closely match the source. The hero title remains readable and optically balanced on desktop and mobile. The source uses a slightly more pronounced multi-tone title treatment; the implementation uses a restrained lavender/white treatment to preserve text accessibility and responsive rendering. This is acceptable P3 variation.

### Spacing and layout rhythm

Desktop page margins, hero split, metric band, and first lower panels align closely with the 1680 × 944 source. The final metric band begins within a few pixels of the source position, and the lower panel transition matches the source rhythm. Card radii, dividers, borders, and internal padding are consistent. Mobile has no horizontal overflow (`scrollWidth === clientWidth`) and both primary actions remain visible before the stage image.

### Colors and visual tokens

The implementation maps the source to a dark navy base with electric blue, cyan, and violet accents. Active, hover, focus, error, selected, and success states maintain usable contrast. No actionable color mismatch remains.

### Image quality and asset fidelity

The hero stage and six “精彩瞬间” thumbnails come directly from the selected visual reference and retain the same subject matter, lighting, and art direction. The OPCWISE mark is a high-density extraction of the supplied Illustrator source, with the “JUELING” text excluded. Crops are sharp at the delivered sizes and show no transparency halo.

### Copy and content

Hero copy, all six information destinations, and both forms were derived from the two supplied requirements documents. The site clearly distinguishes OPCWISE, the AI·OPC 创业者大会, and the first AIGC 产业实践单元. Form labels, option sets, file limits, privacy note, validation messages, and success-number feedback match the requirements.

### Icons

Visible UI icons use one consistent Phosphor line-icon family. Stroke weight, size, color, and alignment are consistent across hero actions, metrics, feature panels, category cards, forms, and mobile controls.

### Responsiveness and accessibility

Desktop and 390 × 844 mobile layouts were browser-rendered and inspected. Semantic headings, buttons, navigation, dialogs, field labels, alt text, focus-visible styling, reduced-motion handling, and practical mobile tap targets are present. The mobile menu opens and closes correctly, dialogs fit the viewport, and no browser console warnings or errors were recorded.

## Primary interactions tested

- All six navigation destinations render the expected page heading.
- Mobile navigation opens and closes.
- The homepage registration CTA opens the two-path chooser.
- Enterprise form: blank submission produces eight required-field errors; completed submission generates an `OPC-E-*` number and success state.
- AIGC form: required identity, path, stage, direction, introduction, and material-link flow submits and generates an `OPC-A-*` number.
- Duplicate-phone logic, file type/size checks, checkbox/radio selected states, and responsive dialogs are implemented.
- Browser console checked: zero errors and zero warnings.

## Comparison history

### Iteration 1

- Earlier finding: **P2 — hero stack sat too low and pushed the metric/panel transition below the source position.**
- Evidence: the initial implementation placed the metric band around 55 px lower than the source at the same 1680 × 944 viewport.
- Fix: removed the extra hero eyebrow, reduced the desktop hero row to the source proportion, and tightened vertical hero padding.
- Post-fix evidence: `implementation-desktop-final.png` and `design-comparison-final.png` show the title, actions, metric band, and first panels aligned to the source rhythm. The P2 mismatch is resolved.

## Findings

No actionable P0, P1, or P2 findings remain.

### Follow-up polish

- **P3 — title color treatment:** the source has a slightly stronger cyan-to-violet variation on “AI · OPC”; the implementation uses a stable lavender tone.
- **P3 — icon micro-fidelity:** the source uses a custom outlined icon set while the implementation uses a consistent production icon family with comparable weight.

These variations do not change hierarchy, usability, brand recognition, or the requested experience.

## Implementation checklist

- [x] Selected visual recreated at the matching desktop viewport
- [x] Supplied logo mark retained and JUELING wordmark removed
- [x] Required navigation and secondary content pages present
- [x] Enterprise and AIGC forms implemented and tested
- [x] Desktop and mobile responsive checks passed
- [x] Console checked
- [x] Production build and Sites worker checks passed

final result: passed
