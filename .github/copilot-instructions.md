# Copilot Instructions for HA BMS Card

## Project Overview
A Home Assistant Lovelace custom card for displaying BMS (Battery Management System) data. Built with Lit 3, TypeScript, and Material You design principles. BMS-agnostic—works with any BMS that exposes sensors to Home Assistant.

## Architecture

### Component Composition Pattern
The main card (`ha-bms-card.ts`) orchestrates child components via property passing—no events bubble up:
- **Entry point**: `src/ha-bms-card.ts` — registers `<ha-bms-card>`, composes all child components
- **Components in `src/components/`**: `soc-ring.ts`, `status-indicator.ts`, `stat-card.ts`, `cell-grid.ts`, `alert-badge.ts`, `temp-bar.ts`
- **Editor**: `src/editor.ts` — visual config UI for HA dashboard, registered as `<ha-bms-card-editor>`

### Key Files
- **`types.ts`**: All TypeScript interfaces (`BMSCardConfig`, `BMSState`, `CellData`, etc.)
- **`const.ts`**: Default templates, thresholds, alarm configs, and `DEFAULT_TEMPLATES` for entity resolution
- **`entity-resolver.ts`**: Maps config to HA entity IDs using `{prefix}` template pattern or explicit overrides
- **`styles.ts`**: CSS-in-JS using Lit's `css` template tag; exports `cardStyles`, `cellGridStyles`, etc.
- **`utils/threshold.ts`**: Functions like `evaluateVoltageState()`, `getVoltageColor()` for threshold logic
- **`utils/format.ts`**: Number formatting helpers (`formatVoltage()`, `formatCurrent()`, etc.)

## Development Workflow

```bash
npm install          # Install dependencies
npm run build        # Production build → dist/ha-bms-card.js
npm run watch        # Development with auto-rebuild
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
```

**Testing locally**: Copy `dist/ha-bms-card.js` to HA's `config/www/` folder and add as Lovelace resource.

## Code Conventions

### LitElement Components
```typescript
@customElement("bms-component-name")  // kebab-case with 'bms-' prefix
export class BMSComponentName extends LitElement {
  @property({ type: Object }) config!: SomeConfig;  // External props
  @state() private _internalState!: SomeState;      // Internal state with underscore
  
  static styles = componentStyles;  // Import from styles.ts
  
  protected render() { /* ... */ }
  private _helperMethod() { /* ... */ }  // Private methods with underscore
}
```

### Entity Resolution Pattern
Entity IDs resolve in priority order:
1. Explicit `entities.soc: sensor.my_custom_entity`
2. Template pattern via `entity_pattern.prefix` + templates in `const.ts`

```typescript
// In const.ts - DEFAULT_TEMPLATES
soc: "sensor.{prefix}_battery_soc"
cell_voltage_pattern: "sensor.{prefix}_cell_{n}_voltage"  // {n} = 1-based cell number
```

### State Management
`BMSState` holds all resolved sensor values. Update flow:
1. `shouldUpdate()` checks if relevant entities changed via `EntityResolver.hasStateChanged()`
2. `_updateState()` pulls values from `hass.states` using resolved entity IDs
3. Child components receive state via properties, re-render on change

### Styling Conventions
- CSS variables prefixed with `--bms-` (e.g., `--bms-success`, `--bms-cell-nominal`)
- Material You color tokens: `--bms-success`, `--bms-warning`, `--bms-error`, `--bms-info`
- Integrate with HA themes via `var(--primary-text-color)`, `var(--ha-card-background)`

## Adding a New Component

1. Create `src/components/my-component.ts` with `@customElement("bms-my-component")`
2. Add styles to `styles.ts` as exported `css` template
3. Import component in `ha-bms-card.ts` (side-effect import: `import "./components/my-component"`)
4. Add to render template in parent component
5. If configurable, update `types.ts` interfaces and `editor.ts` UI

## Configuration Structure
Config merges with defaults in `setConfig()`. See `types.ts` for full interface:
- `cells`: count, columns, layout mode (`incremental`/`bank`)
- `thresholds`: voltage limits (`cell_min`, `cell_low`, `cell_high`, `cell_max`), delta warnings
- `display`: feature toggles (`show_power`, `show_temperatures`, etc.)
- `entity_pattern.prefix`: for template-based entity resolution
- `entities`: explicit entity ID overrides
