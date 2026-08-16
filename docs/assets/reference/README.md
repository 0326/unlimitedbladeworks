# Reference image evidence

`page1-6.png` is a 2×3 contact sheet at 1536×1024. The six independent references are
cropped at the following source rectangles (x, y, width, height):

| Page | File | Source rectangle | QA focus |
| --- | --- | --- | --- |
| 01 Home | `page01-home.png` | `0,0,768,390` | eclipse, two-line Hero, horizon, CTA |
| 02 Explore | `page02-explore.png` | `768,0,768,390` | filter, compass, dominant right Artifact |
| 03 Selected | `page03-selected.png` | `0,390,768,306` | left card, focused sword, badge 03 |
| 04 Draw | `page04-draw.png` | `768,390,768,306` | draw workflow and depth-of-field |
| 05 Viewer | `page05-viewer.png` | `0,696,768,328` | artifact viewer layout |
| 06 Inspection | `page06-inspection.png` | `768,696,768,328` | detail inspection layout |

The original `page7.png` and `page8.png` have identical SHA-256:

`e82fd7408617abf7f45732fab25bf651ac754f1df47c0ff60ce1227741a5662b`

Therefore Page 07 is not independently available; Page 08 is a duplicate Timeline
reference and the missing Page 07 reference remains an explicit follow-up input.

## Page 01–03 safety zones (1536×1024 target)

- Home horizon: y 594–655; Hero title center x 768, y 190–340; CTA center y 720–790.
- Explore filter: x 28–290; compass center x 768, y 52–104; primary Artifact x 980–1340,
  y 170–850.
- Selected card: x 70–370, y 410–860; focused Artifact center x 770, y 140–860;
  hide Explore filter and compass while focused.

These are structural review zones, not pixel-perfect assertions; the automated contract
checks stable DOM geometry in `tests/e2e/visual.spec.ts`.
