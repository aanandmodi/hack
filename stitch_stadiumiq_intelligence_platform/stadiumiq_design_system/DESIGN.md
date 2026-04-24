---
name: StadiumIQ Design System
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#efeeea'
  surface-container-high: '#e9e8e4'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#434841'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ed'
  outline: '#747871'
  outline-variant: '#c3c8bf'
  surface-tint: '#4e644c'
  primary: '#061907'
  on-primary: '#ffffff'
  primary-container: '#1a2e1a'
  on-primary-container: '#7f977c'
  inverse-primary: '#b5cdb0'
  secondary: '#984800'
  on-secondary: '#ffffff'
  secondary-container: '#fe9246'
  on-secondary-container: '#6b3100'
  tertiary: '#001532'
  on-tertiary: '#ffffff'
  tertiary-container: '#022956'
  on-tertiary-container: '#7591c5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e9cb'
  primary-fixed-dim: '#b5cdb0'
  on-primary-fixed: '#0c200d'
  on-primary-fixed-variant: '#374c36'
  secondary-fixed: '#ffdbc8'
  secondary-fixed-dim: '#ffb689'
  on-secondary-fixed: '#311300'
  on-secondary-fixed-variant: '#733500'
  tertiary-fixed: '#d6e3ff'
  tertiary-fixed-dim: '#aac7fe'
  on-tertiary-fixed: '#001b3e'
  on-tertiary-fixed-variant: '#294776'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
typography:
  display-xl:
    fontFamily: notoSerif
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: notoSerif
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: notoSerif
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  ui-button:
    fontFamily: manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 32px
  margin: 64px
  container-max: 1440px
  asymmetric-split: 66%
---

## Brand & Style

The brand personality is authoritative yet welcoming—the digital equivalent of a VIP concierge at a world-class sporting arena. This design system bridges the gap between high-utility data intelligence and the tactile elegance of physical architectural portfolios. It targets venue owners, stakeholders, and high-level operations directors who value precision and prestige.

The visual style combines **Minimalism** with an **Editorial** flair. It utilizes generous negative space to allow complex data to breathe, paired with sharp, intentional structural lines reminiscent of architectural blueprints. The user experience should feel like "luxury wayfinding": effortless, intuitive, and high-contrast, guiding the eye through dense information with the ease of a well-designed stadium concourse.

## Colors

The palette is rooted in a "Warm Ivory" base to avoid the clinical feel of pure white, providing a sophisticated, parchment-like canvas. 

- **Deep Forest Green** serves as the anchor, used for primary navigation and heavy typography to convey stability and heritage. 
- **Burnt Amber** is the surgical "Action Accent," reserved strictly for primary calls to action, active states, and critical wayfinding cues. 
- **Slate Blue** functions as the "Intelligence Layer," used for data visualization, technical status indicators, and secondary UI elements to differentiate functional data from brand storytelling.
- **Neutral Scales** are derived from the Forest Green, using low-opacity tints for borders and dividers to maintain a cohesive, organic atmosphere.

## Typography

The typography strategy employs a "High-Low" pairing to achieve the editorial aesthetic. 

**Noto Serif** is the voice of the brand, used for large-scale headlines and narrative sections. It should be typeset with tight letter-spacing in larger sizes to mimic premium print mastheads. 

**Manrope** provides the functional backbone. It is chosen for its geometric clarity and exceptional readability in data-heavy dashboards. Use the "Label-Caps" style for table headers, small metadata, and wayfinding tags to create a sense of architectural labeling. Maintain ample line-height for body copy to preserve the luxury "breathe-room" of the layout.

## Layout & Spacing

This design system utilizes a **Fixed Grid** model with a focus on asymmetric balance. Use a 12-column grid, but encourage "portfolio layouts" where primary content occupies an 8-column block while a 4-column block remains largely empty or reserved for high-level annotations.

Spacing follows a strict 8px rhythm, but "Macro Spacing" (margins and section gaps) should be intentionally exaggerated (64px+) to enforce the premium feel. Use "Micro Spacing" (8px, 16px) for component internals to ensure data density remains high where it matters most.

## Elevation & Depth

To maintain the architectural feel, this design system avoids heavy shadows. Instead, it uses:

1.  **Low-Contrast Outlines:** Surfaces are defined by 1px borders in Deep Forest Green at 10-15% opacity.
2.  **Tonal Layering:** The Warm Ivory base (#F5F0E8) is the primary canvas, while "Raised" cards use pure white (#FFFFFF) to create a subtle lift.
3.  **Flat Depth:** Hierarchy is established through size and color rather than Z-axis height.
4.  **Accent Blurs:** On mobile or overlay menus, use a very subtle backdrop blur (glassmorphism) to maintain context while focusing the user, tinted with the Ivory base color.

## Shapes

The shape language is "Soft-Architectural." By using **Level 1 (Soft)** roundedness, the UI maintains the precision of a technical drawing while feeling modern and touch-friendly. 

- **Standard Elements:** 4px radius (inputs, buttons, small cards).
- **Featured Containers:** 8px radius (main dashboard widgets).
- **Interactive Tags:** Pill-shaped (fully rounded) for status badges only, to distinguish them from structural elements.
- **Dividers:** Use thin, horizontal or vertical lines that span the full container to emphasize the grid.

## Components

### Buttons
- **Primary:** Burnt Amber background, white text, 4px radius. Use for the single most important action on a page.
- **Secondary:** Deep Forest Green ghost buttons (1px border), uppercase label-caps text.
- **Tertiary:** No border, Deep Forest Green text with a bottom-border hover state.

### Input Fields
- Background-less with a 1px bottom-border only (Forest Green at 20% opacity). Transitions to a full 1px border on focus. Labels should use the "Label-Caps" style sitting 8px above the field.

### Cards
- Pure white background, 8px radius, with a very light Forest Green border. No shadow. Cards should have generous internal padding (24px or 32px).

### Wayfinding Chips
- Small, uppercase, letter-spaced text. Use Slate Blue for "Information" states and Forest Green for "System" states.

### Data Visualization
- Utilize asymmetric layouts for charts. Do not center charts in cards; align them to the left or right to create visual tension and interest. Use the Slate Blue as the primary data color, with Burnt Amber for highlights/outliers.