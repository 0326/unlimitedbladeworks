# Unlimited Blade Works --- Core Pages Interaction Design

> Version: V0.1\
> Status: Visual direction approved\
> Scope: 8 core website experiences

## Experience Overview

Primary experience:

``` text
Home / The Blade Field
        ↓
Explore the Field
        ↓
Discover a Blade
        ↓
Select Blade
        ↓
Draw / Lift Blade
        ↓
Artifact Viewer
        ↓
Detail Inspection
```

Archive and Timeline are alternative discovery paths, and both converge
on the canonical Artifact Viewer.

------------------------------------------------------------------------

# 01 --- Home / The Blade Field

## Purpose

The homepage is the master visual. It should immediately establish
Unlimited Blade as an explorable world rather than a conventional
collection website.

## Visual Composition

An apparently endless field of blades beneath a dramatic sky, with three
depth layers:

-   Foreground: 3--5 large blades, partially out of focus.
-   Midground: dozens of clearly visible blades.
-   Background: hundreds of silhouettes extending toward the horizon.

Primary UI:

``` text
UNLIMITED BLADE

AN ARCHIVE OF LEGENDARY BLADES
HISTORY · MYTH · IMAGINATION

ENTER THE ARCHIVE
```

Top navigation: `EXPLORE / COLLECTIONS / TIMELINE / ABOUT`.

## Ambient Interaction

Without input, the camera slowly moves forward, clouds and particles
evolve subtly, nearby blades exhibit depth-of-field separation, and
mouse movement introduces restrained parallax. The scene must feel like
realtime 3D rather than a background image.

## Enter Interaction

Selecting `ENTER THE ARCHIVE` fades the hero typography, advances the
camera into the field, changes depth of field, reveals exploration
controls, and transitions spatially into page 02.

------------------------------------------------------------------------

# 02 --- Explore / The Blade Field

## Purpose

Allow users to physically explore the archive and discover blades
spatially.

## Interface

A lightweight left filter panel:

``` text
EXPLORE THE FIELD

ALL BLADES        328
HISTORICAL        128
LEGENDARY          97
MYTHICAL           56
FICTIONAL          47

CULTURE
ERA
TYPE
SMITH
LENGTH
STATUS
```

Bottom hints: `WASD MOVE · MOUSE LOOK · CLICK SELECT`.

UI should occupy no more than roughly 15--20% of the viewport.

## Navigation

Desktop: WASD movement, mouse camera look, hover candidate blade, click
selection. Mobile: drag to look, tap to select, optional simplified
movement and reduced scene density.

## Filtering

Filters should transform the world itself. For example,
`Culture → Japan` can fade unrelated blades, emphasize Japanese blades,
update counts, and subtly alter environmental tone.

## Discovery

Important collection objects are distinct from decorative instances.
Hover produces restrained rim lighting and a spatial label such as:

``` text
EXCALIBUR
Britain · Legendary
```

Click proceeds to page 03.

------------------------------------------------------------------------

# 03 --- Blade Selected / Discover a Blade

## Purpose

Create a sense of discovery before removing the blade from the world.

## Visual State

The selected blade becomes the center of attention: restrained warm edge
light, reduced background exposure, focused depth of field, and slightly
quieter ambience.

## Spatial UI

Avoid a conventional modal. Information should appear connected to the
object:

``` text
EXCALIBUR

Britain · Legendary
Arthurian Legend

LEGENDARY

INSPECT BLADE →
```

The user can dismiss back to exploration or select `INSPECT BLADE` to
enter page 04.

------------------------------------------------------------------------

# 04 --- Draw the Blade / Cinematic Transition

## Purpose

Turn navigation into a cinematic transition from exploring a world to
studying an artifact:

``` text
WORLD
  ↓
OBJECT
```

## Sequence

1.  Selected blade reacts subtly.
2.  Dust and particles respond.
3.  Blade lifts from the ground.
4.  Camera approaches and follows.
5.  Blade field becomes defocused.
6.  Motion blur / depth of field increases.
7.  Environmental lighting fades toward black.
8.  Blade rotates into presentation orientation.
9.  Artifact lighting replaces world lighting.
10. Viewer UI appears.

The final frame becomes page 05.

## Animation Properties

Likely timeline-driven properties include camera position/rotation/FOV,
blade transform, fog density, exposure, lights, depth of field, bloom,
world opacity and UI opacity. Theatre.js is a suitable sequencing
candidate.

## Asset Handoff

The field LOD and high-detail viewer model can be separate assets.
Preload the high-detail GLB and hide the swap during movement/defocus.

------------------------------------------------------------------------

# 05 --- Artifact Viewer / 3D Blade Exhibition

## Purpose

Provide museum-grade inspection rather than an ecommerce-style model
viewer.

## Layout

About 60--70% of the viewport is dedicated to the artifact; the
remainder contains structured metadata:

``` text
本庄正宗
HONJŌ MASAMUNE

Japan
Kamakura Period
13th Century

HISTORICAL · LEGENDARY

Type       Katana
Smith      Masamune
Length     ...
Status     Lost
```

Navigation:
`OVERVIEW / DETAILS / HISTORY / CRAFTSMANSHIP / GALLERY / RELATED`.

Controls: `ROTATE / ZOOM / LIGHT / RESET / FULLSCREEN`.

## 3D Interaction

Allow constrained rotate, zoom and pan, camera reset, lighting presets,
fullscreen, optional auto-rotation, and semantic part selection.

## Lighting

Use artifact-oriented lighting: soft key light, long strip reflection,
restrained rim light, and dark neutral environment. Controls should
reveal geometry, polish and texture.

## Semantic Model

GLB nodes should be meaningfully named where possible:

``` text
BladeRoot
├── blade
├── tip
├── guard
├── handle
├── pommel
├── inscription
└── scabbard
```

Japanese extension:

``` text
Katana
├── blade
├── kissaki
├── hamon
├── habaki
├── tsuba
├── tsuka
├── nakago
├── mei
└── saya
```

## Return to Field

`BACK TO FIELD` should spatially reverse the transition: viewer fades,
blade moves away, field returns, blade returns to its location, and
exploration controls reappear.

------------------------------------------------------------------------

# 06 --- Detail Inspection / Craftsmanship View

## Purpose

Turn the 3D model into an educational medium and distinguish Unlimited
Blade from a generic 3D viewer.

## Example: Hamon

Selecting `HAMON` automatically moves the camera toward the blade
surface. After framing completes, annotation appears:

``` text
HAMON
刃文

NOTARE

The visible temper line created
during differential hardening.
```

## Navigation

``` text
OVERVIEW
HAMON
TSUBA
NAKAGO
X-RAY
```

Hotspots may include `HAMON / KISSAKI / MEI / TSUBA`.

## Hotspot Interaction

``` text
Hotspot
   ↓
Camera Tween
   ↓
Focus target
   ↓
Lighting adjustment
   ↓
Annotation reveal
```

Annotations must avoid obscuring important geometry.

## Inspection Modes

-   **Hamon** --- temper line and craftsmanship.
-   **Tsuba / Guard** --- material, school, decoration and provenance.
-   **Nakago / Tang** --- rotate to expose tang where appropriate.
-   **Mei / Inscription** --- transcription, attribution and
    translation.
-   **X-Ray** --- future educational mode revealing structural layers
    and construction.

Selecting `OVERVIEW` smoothly resets to page 05.

------------------------------------------------------------------------

# 07 --- Archive / Collection Database

## Purpose

Provide a high-information-density discovery experience for users who
know what they want or prefer conventional retrieval.

## Header

``` text
THE ARCHIVE

328 BLADES
18 CULTURES
2400+ YEARS
680+ SOURCES
```

## Search and Filters

Search plus `CULTURE / ERA / TYPE / STATUS / SMITH / LENGTH`, sorting
and `GRID / LIST` view.

## Blade Cards

Cards emphasize blade silhouette and proportions rather than ecommerce
presentation:

``` text
HONJŌ MASAMUNE
本庄正宗
Japan · Kamakura Period
HISTORICAL · LEGENDARY
```

Hover responds subtly; click opens the canonical Artifact Viewer.

Search/filter state should be URL-addressable where practical,
e.g. `/archive?culture=japan&type=katana&status=historical`.

------------------------------------------------------------------------

# 08 --- Timeline / Blades Across History

## Purpose

Show blade development across cultures and historical periods, with
blades themselves acting as timeline nodes.

## Layout

Horizontal scale from antiquity to modernity with cultural lanes such as
China, Japan, Europe, Middle East, India and Southeast Asia.

Example evolution:

``` text
CHINA
Bronze Sword → Jian → Han Jian → Tang Sword → Ming Broadsword

JAPAN
Tachi → Katana → Shinshintō

EUROPE
Bronze Age Sword → Gladius → Viking Sword → Longsword → Rapier
```

## Interaction

Users can drag horizontally, zoom the time scale, jump by era, filter
cultures, hover blade nodes and select them.

Hover gives lightweight metadata. Selection opens a contextual drawer:

``` text
EXCALIBUR

Britain · Legendary

Period
Early Medieval

Estimated Time
5th–6th Century

Culture
British / Celtic Legend

VIEW DETAILS →
```

The drawer may also include a regional map and related context.

`VIEW DETAILS` enters the canonical Artifact Viewer. Returning must
restore the previous timeline zoom, date and filters.

------------------------------------------------------------------------

# Shared Interaction Principles

## 1. The 3D World Is Navigation

Prefer spatial state changes:

``` text
Enter → camera advances
Select → world focuses
Inspect → blade rises
Open Viewer → world disappears
Return → blade re-enters world
```

## 2. Museum, Not Game Inventory

The interface should resemble a premium museum/archive experience, not
an RPG inventory, loot system, weapon shop or equipment screen.

## 3. Restrained UI

Use near-black, charcoal, ivory and restrained warm gold/bronze. The
artifact remains the strongest visual element.

## 4. Cinematic Motion

Motion communicates state changes. Key transitions are Home → Explore →
Selected → Draw → Viewer → Detail, plus Archive/Timeline → Viewer.

## 5. Progressive Fidelity

``` text
LOD 0 — distant decorative blades, 100–500 triangles
LOD 1 — nearby field blades, 1k–5k triangles
LOD 2 — selected field blade, medium detail
LOD 3 — Artifact Viewer, high-detail production GLB
```

Background fields should rely heavily on instancing and shared
materials.

## 6. Discovery Sources Converge

Future discovery surfaces may include Blade Field, Archive, Timeline,
Collections, Map, Smith pages, Culture pages and Search. All resolve to
a canonical blade identity such as `/blades/:slug` and the same Artifact
Viewer.

------------------------------------------------------------------------

# Page Relationship

``` text
HOME
 │
 ▼
EXPLORE
 │
 ▼
BLADE SELECTED
 │
 ▼
DRAW THE BLADE
 │
 ▼
ARTIFACT VIEWER ◀──── ARCHIVE
 │
 │               ◀──── TIMELINE
 ▼
DETAIL INSPECTION
```

------------------------------------------------------------------------

# V0.1 Implementation Priority

Recommended order:

1.  Home / Blade Field
2.  Explore
3.  Blade Selected
4.  Artifact Viewer
5.  Detail Inspection
6.  Draw Transition
7.  Archive
8.  Timeline

The cinematic Draw transition should be designed after both endpoint
states are stable.

------------------------------------------------------------------------

# Originality Boundary

The project may draw high-level inspiration from the idea of an infinite
field/archive of blades, but should maintain an independent visual
identity.

Avoid reproducing recognizable copyrighted production elements such as
exact Fate/Unlimited Blade Works scene layouts, sky treatment, giant
gear compositions, logos, typography, character silhouettes, animation
frames or original weapon models.

Develop original recurring visual language around:

-   eclipse / ring-like celestial phenomena;
-   vast blade horizons;
-   restrained black-and-gold museum UI;
-   archive identifiers;
-   inscriptions and blade diagrams;
-   horizon light;
-   atmospheric dust;
-   spatial transitions between world and artifact.

The intended result is an original digital archive whose central
metaphor is an apparently infinite world of blades.
