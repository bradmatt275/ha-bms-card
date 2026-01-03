# Generic BMS Card for Home Assistant

## Project Overview

A custom Lovelace card for Home Assistant that displays battery management system (BMS) data in a visually appealing, Material You-inspired design. The card is BMS-agnostic and uses template patterns for entity configuration, making it compatible with any BMS that exposes sensors to Home Assistant.

### Design Goals
- **BMS Agnostic**: Works with any BMS (JK-BMS, Jakiper/Pylon, Daly, etc.) through flexible entity configuration
- **Material You Design**: Modern, clean aesthetic following Google's Material You design language
- **Single Pack Focus**: Each card instance displays one battery pack
- **Flexible Cell Count**: Supports 4s through 32s configurations
- **Comprehensive Alerts**: Multiple alarm/warning entity support with visual indicators
- **Cell Balancing Visualization**: Show which cells are actively balancing

---

## Visual Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Pack Title                              [Alert Indicators] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────┐          ┌─────────────────┐                  │
│   │ Grid/   │          │                 │     ┌─────────┐  │
│   │ Solar   │◄─────────│   SOC Ring      │────►│  Load   │  │
│   │ Status  │          │   69.30%        │     │ Status  │  │
│   └─────────┘          │   66.61 Ah      │     └─────────┘  │
│                        └─────────────────┘                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │ Voltage    Current  │  │ MOS Temp   Delta mV │           │
│  │  53.92V     19A     │  │  34.5°C      9 mV   │           │
│  │ Power               │  │ Env Temp            │           │
│  │  1023W              │  │  28.0°C             │           │
│  └─────────────────────┘  └─────────────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                     Cell Voltage Grid                       │
│  ┌────────────────────────┐  ┌────────────────────────────┐ │
│  │ 01  3.371 V  [===   ] │  │ 09  3.374 V  [====  ]     │ │
│  │ 02  3.372 V  [===   ] │  │ 10  3.374 V  [====  ]     │ │
│  │ 03  3.372 V  [===   ] │  │ 11  3.380 V  [=====●]     │ │
│  │ 04  3.372 V  [===   ] │  │ 12  3.373 V  [====  ]     │ │
│  │ 05  3.372 V  [===   ] │  │ 13  3.379 V  [====  ]     │ │
│  │ 06  3.374 V  [====  ] │  │ 14  3.374 V  [====  ]     │ │
│  │ 07  3.374 V  [====  ] │  │ 15  3.373 V  [====  ]     │ │
│  │ 08  3.372 V  [===   ] │  │ 16  3.373 V  [====  ]     │ │
│  └────────────────────────┘  └────────────────────────────┘ │
│                                                             │
│  [● = actively balancing indicator]                         │
├─────────────────────────────────────────────────────────────┤
│  Temperature Sensors (optional expandable section)          │
│  T1-4: 32.9°C  T5-8: 33.0°C  T9-12: 33.1°C  T13-16: 32.7°C │
└─────────────────────────────────────────────────────────────┘
```

### Material You Color Palette

#### Theme-Derived Colors (from HA theme)
- **Primary**: Card title, active states, SOC ring (when healthy)
- **On-Surface**: Primary text color
- **Surface-Variant**: Secondary text, borders, dividers
- **Surface-Container**: Card background, section backgrounds

#### Custom Status Colors (defined in card)
```css
:root {
  /* Status Colors - Material You tonal palette */
  --bms-success: #4CAF50;           /* Green 500 - healthy state */
  --bms-success-container: #C8E6C9; /* Green 100 - success background */
  
  --bms-warning: #FF9800;           /* Orange 500 - warning state */
  --bms-warning-container: #FFE0B2; /* Orange 100 - warning background */
  
  --bms-error: #F44336;             /* Red 500 - error/alarm state */
  --bms-error-container: #FFCDD2;   /* Red 100 - error background */
  
  --bms-info: #2196F3;              /* Blue 500 - informational */
  --bms-info-container: #BBDEFB;    /* Blue 100 - info background */
  
  /* Cell voltage gradient stops */
  --bms-cell-low: #F44336;          /* Below min threshold */
  --bms-cell-nominal: #4CAF50;      /* Within normal range */
  --bms-cell-high: #FF9800;         /* Approaching max threshold */
  --bms-cell-critical: #9C27B0;     /* Above max threshold */
  
  /* Balancing indicator */
  --bms-balancing: #00BCD4;         /* Cyan 500 */
  --bms-balancing-pulse: #00BCD480; /* Cyan with alpha for animation */
}
```

### Typography (Material You)
- **Card Title**: 16sp, Medium weight
- **Primary Values**: 24sp, Medium weight (SOC percentage, voltage, current)
- **Secondary Values**: 14sp, Regular weight (labels, units)
- **Cell Numbers**: 12sp, Medium weight, monospace
- **Cell Voltages**: 14sp, Regular weight, monospace

### Spacing & Elevation
- **Card Padding**: 16px
- **Section Gap**: 12px
- **Inner Element Padding**: 8-12px
- **Border Radius**: 16px (card), 12px (sections), 8px (cells)
- **Elevation**: Level 1 (card surface)

---

## Configuration Schema

### YAML Configuration

```yaml
type: custom:generic-bms-card
title: "Pack 1"

# Cell Configuration
cells:
  count: 16                    # 4, 8, 16, 24, or 32
  columns: 2                   # 1, 2, 3, or 4
  layout: bank                 # 'incremental' or 'bank'
  orientation: horizontal      # 'horizontal' or 'vertical'

# Voltage Thresholds (for cell coloring)
thresholds:
  cell_min: 2.8               # Below this = critical (red)
  cell_low: 3.0               # Below this = warning (orange)
  cell_high: 3.45             # Above this = warning (orange)  
  cell_max: 3.65              # Above this = critical (purple)
  delta_warning: 20           # Delta mV warning threshold
  delta_critical: 50          # Delta mV critical threshold

# Temperature Thresholds
temperature:
  warning: 40                 # °C - show warning color
  critical: 50                # °C - show critical color

# Display Options
display:
  delta_unit: mV              # 'mV' or 'V'
  show_power: true
  show_temperatures: true
  show_cycle_count: true
  show_capacity: true
  compact_mode: false         # Reduces padding for smaller cards

# Entity Configuration
# Option 1: Template Pattern (recommended for consistent naming)
entity_pattern:
  prefix: "pack_1"            # Replaces {prefix} in templates

# Option 2: Explicit Entity Mapping (overrides templates)
entities:
  # Pack-level sensors
  soc: sensor.pack_1_battery_soc
  voltage: sensor.pack_1_battery_voltage
  current: sensor.pack_1_battery_current
  power: sensor.pack_1_battery_power          # Optional: calculated from V×A if missing
  capacity_remaining: sensor.pack_1_remaining_capacity
  capacity_full: sensor.pack_1_battery_full_capacity
  cycle_count: sensor.pack_1_cycle_count
  
  # Derived values (all optional - calculated from cell voltages if not specified)
  delta_voltage: sensor.pack_1_delta_voltage          # Omit to auto-calculate
  average_cell_voltage: sensor.pack_1_avg_cell_voltage  # Omit to auto-calculate
  min_cell_voltage: sensor.pack_1_min_cell_voltage    # Omit to auto-calculate
  max_cell_voltage: sensor.pack_1_max_cell_voltage    # Omit to auto-calculate
  
  # Temperature sensors
  temp_mos: sensor.pack_1_mos_temp
  temp_env: sensor.pack_1_env_temp
  temp_cells:                 # Array of cell temperature sensors
    - sensor.pack_1_cell_temp_1_4
    - sensor.pack_1_cell_temp_5_8
    - sensor.pack_1_cell_temp_9_12
    - sensor.pack_1_cell_temp_13_16
  
  # Cell voltages (can use pattern or explicit list)
  cell_voltages:
    pattern: "sensor.{prefix}_cell_{n}_voltage"
    # OR explicit:
    # - sensor.pack_1_cell_1_voltage
    # - sensor.pack_1_cell_2_voltage
    # ... etc
  
  # Cell balancing status (optional - array of binary sensors)
  cell_balancing:
    pattern: "binary_sensor.{prefix}_cell_{n}_balancing"
  
  # System status
  charging: binary_sensor.pack_1_charge_mos
  discharging: binary_sensor.pack_1_discharge_mos
  balancing_active: binary_sensor.pack_1_balancing  # Overall balancing state
  heater: binary_sensor.pack_1_heater
  
  # Alarms/Warnings (array - all monitored for active state)
  alarms:
    - entity: binary_sensor.pack_1_cell_ovp
      label: "Cell OVP"
      severity: critical
    - entity: binary_sensor.pack_1_cell_uvp
      label: "Cell UVP"
      severity: critical
    - entity: binary_sensor.pack_1_pack_uvp
      label: "Pack UVP"
      severity: critical
    - entity: binary_sensor.pack_1_discharge_ocp
      label: "Discharge OCP"
      severity: critical
    - entity: binary_sensor.pack_1_charge_ocp
      label: "Charge OCP"
      severity: critical
    - entity: binary_sensor.pack_1_scp_protection
      label: "Short Circuit"
      severity: critical
    - entity: binary_sensor.pack_1_mos_otp
      label: "MOS Over Temp"
      severity: warning
    - entity: binary_sensor.pack_1_env_otp
      label: "Env Over Temp"
      severity: warning
    - entity: binary_sensor.pack_1_env_utp
      label: "Env Under Temp"
      severity: warning
    - entity: binary_sensor.pack_1_alarm_soc_low
      label: "Low SOC"
      severity: warning
    - entity: binary_sensor.pack_1_bms_cell_fault
      label: "Cell Fault"
      severity: critical
    - entity: binary_sensor.pack_1_bms_ntc_fault
      label: "NTC Fault"
      severity: warning
```

### Calculated vs Sensor Values

For certain metrics, the card supports both explicit sensor entities AND automatic calculation from available data. If a sensor is specified, it takes priority. If not, the card calculates the value.

| Metric | Calculation Method | Sensor Override |
|--------|-------------------|-----------------|
| Delta Voltage | `max(cell_voltages) - min(cell_voltages)` | `entities.delta_voltage` |
| Average Cell Voltage | `sum(cell_voltages) / cell_count` | `entities.average_cell_voltage` |
| Min Cell Voltage | `min(cell_voltages)` | `entities.min_cell_voltage` |
| Max Cell Voltage | `max(cell_voltages)` | `entities.max_cell_voltage` |
| Min Cell Number | Index of lowest voltage cell | (derived only) |
| Max Cell Number | Index of highest voltage cell | (derived only) |
| Power | `voltage × current` | `entities.power` |

**Implementation Pattern:**

```typescript
// In state update logic
private _calculateDerivedValues(): void {
  const voltages = this._state.cells
    .map(c => c.voltage)
    .filter((v): v is number => v !== null);

  if (voltages.length === 0) return;

  // Delta voltage - use sensor if available, otherwise calculate
  const deltaEntity = this._entityResolver.getEntity("delta_voltage");
  if (deltaEntity && this.hass.states[deltaEntity]) {
    this._state.deltaVoltage = parseFloat(this.hass.states[deltaEntity].state);
  } else {
    this._state.deltaVoltage = Math.max(...voltages) - Math.min(...voltages);
  }

  // Average cell voltage
  const avgEntity = this._entityResolver.getEntity("average_cell_voltage");
  if (avgEntity && this.hass.states[avgEntity]) {
    this._state.averageCellVoltage = parseFloat(this.hass.states[avgEntity].state);
  } else {
    this._state.averageCellVoltage = voltages.reduce((a, b) => a + b, 0) / voltages.length;
  }

  // Min/Max values and cell identification
  this._state.minVoltage = Math.min(...voltages);
  this._state.maxVoltage = Math.max(...voltages);
  this._state.minCellNumber = this._state.cells.find(c => c.voltage === this._state.minVoltage)?.number ?? null;
  this._state.maxCellNumber = this._state.cells.find(c => c.voltage === this._state.maxVoltage)?.number ?? null;

  // Power - use sensor if available, otherwise calculate
  const powerEntity = this._entityResolver.getEntity("power");
  if (powerEntity && this.hass.states[powerEntity]) {
    this._state.power = parseFloat(this.hass.states[powerEntity].state);
  } else if (this._state.voltage !== null && this._state.current !== null) {
    this._state.power = this._state.voltage * this._state.current;
  }
}
```

### Default Entity Templates

When using `entity_pattern.prefix`, the card auto-generates entity IDs using these templates:

```javascript
const DEFAULT_TEMPLATES = {
  // Sensors
  soc: "sensor.{prefix}_battery_soc",
  voltage: "sensor.{prefix}_battery_voltage",
  current: "sensor.{prefix}_battery_current",
  power: "sensor.{prefix}_battery_power",
  capacity_remaining: "sensor.{prefix}_remaining_capacity",
  capacity_full: "sensor.{prefix}_battery_full_capacity",
  cycle_count: "sensor.{prefix}_cycle_count",
  
  // Temperatures
  temp_mos: "sensor.{prefix}_mos_temp",
  temp_env: "sensor.{prefix}_env_temp",
  temp_cell_pattern: "sensor.{prefix}_cell_temp_{range}",
  // Default ranges: ["1_4", "5_8", "9_12", "13_16"] for 16s
  
  // Cell voltages
  cell_voltage_pattern: "sensor.{prefix}_cell_{n}_voltage",
  
  // Binary sensors
  charging: "binary_sensor.{prefix}_charge_mos",
  discharging: "binary_sensor.{prefix}_discharge_mos",
  heater: "binary_sensor.{prefix}_heater",
  
  // Common alarm patterns
  alarm_cell_ovp: "binary_sensor.{prefix}_cell_ovp",
  alarm_cell_uvp: "binary_sensor.{prefix}_cell_uvp",
  alarm_pack_uvp: "binary_sensor.{prefix}_pack_uvp",
  alarm_discharge_ocp: "binary_sensor.{prefix}_dsg_ocp",
  alarm_charge_ocp: "binary_sensor.{prefix}_chg_ocp",
  alarm_scp: "binary_sensor.{prefix}_scp",
  alarm_mos_otp: "binary_sensor.{prefix}_mos_otp",
  alarm_env_otp: "binary_sensor.{prefix}_env_otp",
  alarm_env_utp: "binary_sensor.{prefix}_env_utp",
};
```

---

## Component Architecture

### File Structure

```
generic-bms-card/
├── dist/
│   └── generic-bms-card.js     # Bundled output
├── src/
│   ├── generic-bms-card.ts     # Main card class
│   ├── editor.ts               # Visual config editor
│   ├── types.ts                # TypeScript interfaces
│   ├── const.ts                # Constants & defaults
│   ├── styles.ts               # CSS-in-JS styles
│   ├── localize.ts             # i18n support
│   ├── entity-resolver.ts      # Template pattern resolution
│   │
│   ├── components/
│   │   ├── soc-ring.ts         # Circular SOC gauge
│   │   ├── status-indicator.ts # Charge/discharge icons
│   │   ├── stat-card.ts        # Voltage/current/temp cards
│   │   ├── cell-grid.ts        # Cell voltage display
│   │   ├── cell-item.ts        # Individual cell component
│   │   ├── alert-badge.ts      # Alert indicator badges
│   │   └── temp-bar.ts         # Temperature sensor display
│   │
│   └── utils/
│       ├── color.ts            # Color calculations
│       ├── format.ts           # Number formatting
│       └── threshold.ts        # Threshold evaluation
│
├── package.json
├── rollup.config.js
├── tsconfig.json
└── hacs.json
```

### Main Card Class

```typescript
// src/generic-bms-card.ts
import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard, LovelaceCardConfig } from "custom-card-helpers";

import { BMSCardConfig, BMSState } from "./types";
import { EntityResolver } from "./entity-resolver";
import { styles } from "./styles";

// Import components
import "./components/soc-ring";
import "./components/status-indicator";
import "./components/stat-card";
import "./components/cell-grid";
import "./components/alert-badge";
import "./components/temp-bar";

@customElement("generic-bms-card")
export class GenericBMSCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: BMSCardConfig;
  @state() private _state!: BMSState;
  
  private _entityResolver!: EntityResolver;

  static styles = styles;

  public setConfig(config: LovelaceCardConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    
    this._config = {
      title: config.title || "Battery Pack",
      cells: {
        count: config.cells?.count || 16,
        columns: config.cells?.columns || 2,
        layout: config.cells?.layout || "bank",
        orientation: config.cells?.orientation || "horizontal",
      },
      thresholds: {
        cell_min: config.thresholds?.cell_min || 2.8,
        cell_low: config.thresholds?.cell_low || 3.0,
        cell_high: config.thresholds?.cell_high || 3.45,
        cell_max: config.thresholds?.cell_max || 3.65,
        delta_warning: config.thresholds?.delta_warning || 20,
        delta_critical: config.thresholds?.delta_critical || 50,
      },
      temperature: {
        warning: config.temperature?.warning || 40,
        critical: config.temperature?.critical || 50,
      },
      display: {
        delta_unit: config.display?.delta_unit || "mV",
        show_power: config.display?.show_power ?? true,
        show_temperatures: config.display?.show_temperatures ?? true,
        show_cycle_count: config.display?.show_cycle_count ?? true,
        show_capacity: config.display?.show_capacity ?? true,
        compact_mode: config.display?.compact_mode ?? false,
      },
      entity_pattern: config.entity_pattern,
      entities: config.entities || {},
    };
    
    this._entityResolver = new EntityResolver(this._config);
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has("_config")) return true;
    
    const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
    if (!oldHass) return true;
    
    // Only update if relevant entities changed
    return this._entityResolver.hasStateChanged(oldHass, this.hass);
  }

  protected updated(changedProps: PropertyValues): void {
    if (changedProps.has("hass") || changedProps.has("_config")) {
      this._updateState();
    }
  }

  private _updateState(): void {
    if (!this.hass) return;
    
    const resolver = this._entityResolver;
    const cells = [];
    
    for (let i = 1; i <= this._config.cells.count; i++) {
      const voltageEntity = resolver.getCellVoltageEntity(i);
      const balancingEntity = resolver.getCellBalancingEntity(i);
      
      cells.push({
        number: i,
        voltage: this._getNumericState(voltageEntity),
        balancing: this._getBinaryState(balancingEntity),
      });
    }
    
    const voltages = cells.map(c => c.voltage).filter(v => v !== null) as number[];
    const minVoltage = Math.min(...voltages);
    const maxVoltage = Math.max(...voltages);
    const deltaVoltage = maxVoltage - minVoltage;
    
    this._state = {
      soc: this._getNumericState(resolver.getEntity("soc")),
      voltage: this._getNumericState(resolver.getEntity("voltage")),
      current: this._getNumericState(resolver.getEntity("current")),
      power: this._getNumericState(resolver.getEntity("power")),
      capacityRemaining: this._getNumericState(resolver.getEntity("capacity_remaining")),
      capacityFull: this._getNumericState(resolver.getEntity("capacity_full")),
      cycleCount: this._getNumericState(resolver.getEntity("cycle_count")),
      
      tempMos: this._getNumericState(resolver.getEntity("temp_mos")),
      tempEnv: this._getNumericState(resolver.getEntity("temp_env")),
      tempCells: resolver.getTempCellEntities().map(e => this._getNumericState(e)),
      
      cells,
      minVoltage,
      maxVoltage,
      deltaVoltage,
      
      isCharging: this._getBinaryState(resolver.getEntity("charging")),
      isDischarging: this._getBinaryState(resolver.getEntity("discharging")),
      isBalancing: this._getBinaryState(resolver.getEntity("balancing_active")),
      heaterOn: this._getBinaryState(resolver.getEntity("heater")),
      
      activeAlarms: this._getActiveAlarms(),
    };
  }

  private _getNumericState(entityId: string | undefined): number | null {
    if (!entityId || !this.hass.states[entityId]) return null;
    const state = this.hass.states[entityId].state;
    const num = parseFloat(state);
    return isNaN(num) ? null : num;
  }

  private _getBinaryState(entityId: string | undefined): boolean {
    if (!entityId || !this.hass.states[entityId]) return false;
    return this.hass.states[entityId].state === "on";
  }

  private _getActiveAlarms(): Array<{ label: string; severity: string }> {
    const alarms = this._config.entities.alarms || [];
    return alarms
      .filter(alarm => this._getBinaryState(alarm.entity))
      .map(alarm => ({ label: alarm.label, severity: alarm.severity }));
  }

  protected render() {
    if (!this._config || !this._state) {
      return html`<ha-card>Loading...</ha-card>`;
    }

    const { _config: config, _state: state } = this;
    const hasActiveAlarms = state.activeAlarms.length > 0;
    const hasCriticalAlarm = state.activeAlarms.some(a => a.severity === "critical");

    return html`
      <ha-card class="${config.display.compact_mode ? "compact" : ""}">
        <!-- Header -->
        <div class="card-header">
          <span class="title">${config.title}</span>
          <div class="alert-indicators">
            ${state.activeAlarms.map(alarm => html`
              <bms-alert-badge
                .label=${alarm.label}
                .severity=${alarm.severity}
              ></bms-alert-badge>
            `)}
          </div>
        </div>

        <!-- Main Content -->
        <div class="card-content">
          <!-- Status Row -->
          <div class="status-row">
            <bms-status-indicator
              type="charge"
              .active=${state.isCharging}
              label="Grid/Solar"
            ></bms-status-indicator>

            <bms-soc-ring
              .soc=${state.soc}
              .remaining=${state.capacityRemaining}
              .hasAlarm=${hasCriticalAlarm}
            ></bms-soc-ring>

            <bms-status-indicator
              type="discharge"
              .active=${state.isDischarging}
              label="Load"
            ></bms-status-indicator>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid">
            <bms-stat-card class="stats-primary">
              <div class="stat-row">
                <bms-stat label="Voltage" .value=${state.voltage} unit="V" size="large"></bms-stat>
                <bms-stat label="Current" .value=${state.current} unit="A" size="large"></bms-stat>
              </div>
              ${config.display.show_power ? html`
                <bms-stat label="Power" .value=${state.power} unit="W"></bms-stat>
              ` : ""}
              ${config.display.show_capacity ? html`
                <bms-stat label="Capacity" .value=${state.capacityRemaining} unit="Ah"></bms-stat>
              ` : ""}
            </bms-stat-card>

            <bms-stat-card class="stats-secondary">
              <bms-stat 
                label="MOS Temp" 
                .value=${state.tempMos} 
                unit="°C"
                .warning=${state.tempMos !== null && state.tempMos >= config.temperature.warning}
                .critical=${state.tempMos !== null && state.tempMos >= config.temperature.critical}
              ></bms-stat>
              <bms-stat
                label="Delta"
                .value=${config.display.delta_unit === "mV" 
                  ? (state.deltaVoltage * 1000).toFixed(0) 
                  : state.deltaVoltage.toFixed(3)}
                unit=${config.display.delta_unit}
                .warning=${state.deltaVoltage * 1000 >= config.thresholds.delta_warning}
                .critical=${state.deltaVoltage * 1000 >= config.thresholds.delta_critical}
              ></bms-stat>
              ${config.display.show_cycle_count ? html`
                <bms-stat label="Cycles" .value=${state.cycleCount}></bms-stat>
              ` : ""}
            </bms-stat-card>
          </div>

          <!-- Cell Grid -->
          <bms-cell-grid
            .cells=${state.cells}
            .columns=${config.cells.columns}
            .layout=${config.cells.layout}
            .orientation=${config.cells.orientation}
            .thresholds=${config.thresholds}
            .minCellNumber=${state.minCellNumber}
            .maxCellNumber=${state.maxCellNumber}
          ></bms-cell-grid>

          <!-- Temperature Sensors -->
          ${config.display.show_temperatures && state.tempCells.length > 0 ? html`
            <div class="temp-section">
              <div class="temp-grid">
                ${state.tempCells.map((temp, i) => html`
                  <bms-temp-bar
                    label="T${this._getTempRange(i)}"
                    .value=${temp}
                    .warning=${config.temperature.warning}
                    .critical=${config.temperature.critical}
                  ></bms-temp-bar>
                `)}
              </div>
            </div>
          ` : ""}
        </div>
      </ha-card>
    `;
  }

  private _getTempRange(index: number): string {
    const cellsPerSensor = Math.ceil(this._config.cells.count / 4);
    const start = index * cellsPerSensor + 1;
    const end = Math.min((index + 1) * cellsPerSensor, this._config.cells.count);
    return `${start}-${end}`;
  }

  public getCardSize(): number {
    return this._config.display.compact_mode ? 4 : 6;
  }

  static getConfigElement() {
    return document.createElement("generic-bms-card-editor");
  }

  static getStubConfig() {
    return {
      title: "Battery Pack",
      cells: { count: 16, columns: 2 },
      entity_pattern: { prefix: "pack_1" },
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "generic-bms-card": GenericBMSCard;
  }
}
```

### Entity Resolver

```typescript
// src/entity-resolver.ts
import { BMSCardConfig } from "./types";
import { DEFAULT_TEMPLATES } from "./const";
import { HomeAssistant } from "custom-card-helpers";

export class EntityResolver {
  private _config: BMSCardConfig;
  private _resolvedEntities: Map<string, string> = new Map();
  private _allEntityIds: string[] = [];

  constructor(config: BMSCardConfig) {
    this._config = config;
    this._resolveAllEntities();
  }

  private _resolveAllEntities(): void {
    const prefix = this._config.entity_pattern?.prefix || "";
    
    // Resolve standard entities
    const standardKeys = [
      "soc", "voltage", "current", "power", 
      "capacity_remaining", "capacity_full", "cycle_count",
      "temp_mos", "temp_env", "charging", "discharging", 
      "balancing_active", "heater"
    ];
    
    for (const key of standardKeys) {
      // Check explicit config first
      const explicit = this._config.entities?.[key];
      if (explicit) {
        this._resolvedEntities.set(key, explicit);
        this._allEntityIds.push(explicit);
        continue;
      }
      
      // Fall back to template
      const template = DEFAULT_TEMPLATES[key];
      if (template && prefix) {
        const resolved = template.replace("{prefix}", prefix);
        this._resolvedEntities.set(key, resolved);
        this._allEntityIds.push(resolved);
      }
    }
    
    // Resolve cell voltages
    for (let i = 1; i <= this._config.cells.count; i++) {
      const entity = this._resolveCellVoltage(i, prefix);
      if (entity) {
        this._resolvedEntities.set(`cell_voltage_${i}`, entity);
        this._allEntityIds.push(entity);
      }
    }
    
    // Resolve cell balancing (if available)
    for (let i = 1; i <= this._config.cells.count; i++) {
      const entity = this._resolveCellBalancing(i, prefix);
      if (entity) {
        this._resolvedEntities.set(`cell_balancing_${i}`, entity);
        this._allEntityIds.push(entity);
      }
    }
    
    // Resolve temperature sensors
    const tempCells = this._config.entities?.temp_cells;
    if (Array.isArray(tempCells)) {
      tempCells.forEach((e, i) => {
        this._resolvedEntities.set(`temp_cell_${i}`, e);
        this._allEntityIds.push(e);
      });
    } else if (prefix) {
      // Generate default temp sensor entities
      const tempRanges = this._generateTempRanges();
      tempRanges.forEach((range, i) => {
        const entity = `sensor.${prefix}_cell_temp_${range}`;
        this._resolvedEntities.set(`temp_cell_${i}`, entity);
        this._allEntityIds.push(entity);
      });
    }
    
    // Resolve alarms
    const alarms = this._config.entities?.alarms || [];
    alarms.forEach((alarm, i) => {
      this._allEntityIds.push(alarm.entity);
    });
  }

  private _resolveCellVoltage(cellNum: number, prefix: string): string | undefined {
    // Check explicit cell voltage array
    const explicit = this._config.entities?.cell_voltages;
    if (Array.isArray(explicit) && explicit[cellNum - 1]) {
      return explicit[cellNum - 1];
    }
    
    // Check pattern in config
    const configPattern = typeof explicit === "object" && explicit?.pattern;
    if (configPattern) {
      return configPattern
        .replace("{prefix}", prefix)
        .replace("{n}", String(cellNum));
    }
    
    // Use default pattern
    if (prefix) {
      return DEFAULT_TEMPLATES.cell_voltage_pattern
        .replace("{prefix}", prefix)
        .replace("{n}", String(cellNum));
    }
    
    return undefined;
  }

  private _resolveCellBalancing(cellNum: number, prefix: string): string | undefined {
    const explicit = this._config.entities?.cell_balancing;
    if (typeof explicit === "object" && explicit?.pattern) {
      return explicit.pattern
        .replace("{prefix}", prefix)
        .replace("{n}", String(cellNum));
    }
    return undefined;
  }

  private _generateTempRanges(): string[] {
    const cellCount = this._config.cells.count;
    const sensorsCount = 4; // Typical 4 temp sensors
    const cellsPerSensor = Math.ceil(cellCount / sensorsCount);
    
    const ranges: string[] = [];
    for (let i = 0; i < sensorsCount; i++) {
      const start = i * cellsPerSensor + 1;
      const end = Math.min((i + 1) * cellsPerSensor, cellCount);
      ranges.push(`${start}_${end}`);
    }
    return ranges;
  }

  public getEntity(key: string): string | undefined {
    return this._resolvedEntities.get(key);
  }

  public getCellVoltageEntity(cellNum: number): string | undefined {
    return this._resolvedEntities.get(`cell_voltage_${cellNum}`);
  }

  public getCellBalancingEntity(cellNum: number): string | undefined {
    return this._resolvedEntities.get(`cell_balancing_${cellNum}`);
  }

  public getTempCellEntities(): string[] {
    const entities: string[] = [];
    let i = 0;
    while (this._resolvedEntities.has(`temp_cell_${i}`)) {
      entities.push(this._resolvedEntities.get(`temp_cell_${i}`)!);
      i++;
    }
    return entities;
  }

  public hasStateChanged(oldHass: HomeAssistant, newHass: HomeAssistant): boolean {
    return this._allEntityIds.some(entityId => {
      const oldState = oldHass.states[entityId];
      const newState = newHass.states[entityId];
      return oldState !== newState;
    });
  }

  public getAllEntityIds(): string[] {
    return this._allEntityIds;
  }
}
```

### Cell Grid Component

```typescript
// src/components/cell-grid.ts
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CellData, Thresholds } from "../types";

@customElement("bms-cell-grid")
export class BMSCellGrid extends LitElement {
  @property({ type: Array }) cells: CellData[] = [];
  @property({ type: Number }) columns = 2;
  @property({ type: String }) layout: "incremental" | "bank" = "bank";
  @property({ type: String }) orientation: "horizontal" | "vertical" = "horizontal";
  @property({ type: Object }) thresholds!: Thresholds;
  @property({ type: Number }) minCellNumber: number | null = null;
  @property({ type: Number }) maxCellNumber: number | null = null;

  static styles = css`
    :host {
      display: block;
    }

    .cell-grid {
      display: grid;
      gap: 4px;
    }

    .cell-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background: var(--ha-card-background, var(--card-background-color));
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(255,255,255,0.1));
      transition: background-color 0.2s ease;
    }

    .cell-number {
      font-size: 12px;
      font-weight: 500;
      font-family: monospace;
      color: var(--secondary-text-color);
      min-width: 24px;
      padding: 2px 6px;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-radius: 4px;
      text-align: center;
    }

    .cell-voltage {
      flex: 1;
      font-size: 14px;
      font-family: monospace;
      margin-left: 12px;
    }

    .cell-bar {
      width: 60px;
      height: 6px;
      background: var(--divider-color, rgba(255,255,255,0.1));
      border-radius: 3px;
      overflow: hidden;
      margin-left: 8px;
    }

    .cell-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease, background-color 0.3s ease;
    }

    .balancing-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-left: 8px;
      background: var(--bms-balancing, #00BCD4);
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }

    /* Min/Max highlighting */
    .cell-item.is-min .cell-voltage {
      color: var(--bms-cell-low, #FF9800);
    }

    .cell-item.is-max .cell-voltage {
      color: var(--bms-cell-high, #FF9800);
    }

    /* Voltage state colors */
    .cell-item.critical-low .cell-number { background: var(--bms-error, #F44336); }
    .cell-item.warning-low .cell-number { background: var(--bms-warning, #FF9800); }
    .cell-item.warning-high .cell-number { background: var(--bms-warning, #FF9800); }
    .cell-item.critical-high .cell-number { background: var(--bms-error, #9C27B0); }
  `;

  protected render() {
    const gridStyle = this._getGridStyle();
    const orderedCells = this._getOrderedCells();

    return html`
      <div class="cell-grid" style="${gridStyle}">
        ${orderedCells.map(cell => this._renderCell(cell))}
      </div>
    `;
  }

  private _getGridStyle(): string {
    return `grid-template-columns: repeat(${this.columns}, 1fr);`;
  }

  private _getOrderedCells(): CellData[] {
    if (this.layout === "incremental") {
      // 1, 2, 3, 4... across columns then rows
      return [...this.cells];
    }

    // Bank mode: split into columns
    // For 16 cells with 2 columns: col1 = 1-8, col2 = 9-16
    const cellsPerColumn = Math.ceil(this.cells.length / this.columns);
    const ordered: CellData[] = [];

    for (let row = 0; row < cellsPerColumn; row++) {
      for (let col = 0; col < this.columns; col++) {
        const index = col * cellsPerColumn + row;
        if (index < this.cells.length) {
          ordered.push(this.cells[index]);
        }
      }
    }

    return ordered;
  }

  private _renderCell(cell: CellData) {
    const voltage = cell.voltage;
    const isMin = cell.number === this.minCellNumber;
    const isMax = cell.number === this.maxCellNumber;
    const stateClass = this._getVoltageStateClass(voltage);
    const barWidth = this._getBarWidth(voltage);
    const barColor = this._getBarColor(voltage);

    return html`
      <div class="cell-item ${stateClass} ${isMin ? 'is-min' : ''} ${isMax ? 'is-max' : ''}">
        <span class="cell-number">${String(cell.number).padStart(2, '0')}</span>
        <span class="cell-voltage">${voltage?.toFixed(3) ?? '---'} V</span>
        <div class="cell-bar">
          <div 
            class="cell-bar-fill" 
            style="width: ${barWidth}%; background: ${barColor};"
          ></div>
        </div>
        ${cell.balancing ? html`<div class="balancing-indicator"></div>` : ''}
      </div>
    `;
  }

  private _getVoltageStateClass(voltage: number | null): string {
    if (voltage === null) return '';
    const t = this.thresholds;
    
    if (voltage < t.cell_min) return 'critical-low';
    if (voltage < t.cell_low) return 'warning-low';
    if (voltage > t.cell_max) return 'critical-high';
    if (voltage > t.cell_high) return 'warning-high';
    return '';
  }

  private _getBarWidth(voltage: number | null): number {
    if (voltage === null) return 0;
    const t = this.thresholds;
    const range = t.cell_max - t.cell_min;
    const normalized = (voltage - t.cell_min) / range;
    return Math.max(0, Math.min(100, normalized * 100));
  }

  private _getBarColor(voltage: number | null): string {
    if (voltage === null) return 'var(--divider-color)';
    const t = this.thresholds;
    
    if (voltage < t.cell_min) return 'var(--bms-cell-low, #F44336)';
    if (voltage < t.cell_low) return 'var(--bms-warning, #FF9800)';
    if (voltage > t.cell_max) return 'var(--bms-cell-critical, #9C27B0)';
    if (voltage > t.cell_high) return 'var(--bms-cell-high, #FF9800)';
    return 'var(--bms-cell-nominal, #4CAF50)';
  }
}
```

### SOC Ring Component

```typescript
// src/components/soc-ring.ts
import { LitElement, html, css, svg } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("bms-soc-ring")
export class BMSSocRing extends LitElement {
  @property({ type: Number }) soc: number | null = null;
  @property({ type: Number }) remaining: number | null = null;
  @property({ type: Boolean }) hasAlarm = false;

  static styles = css`
    :host {
      display: block;
    }

    .soc-container {
      position: relative;
      width: 140px;
      height: 140px;
    }

    svg {
      transform: rotate(-90deg);
    }

    .ring-bg {
      fill: none;
      stroke: var(--divider-color, rgba(255,255,255,0.1));
      stroke-width: 8;
    }

    .ring-progress {
      fill: none;
      stroke-width: 8;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease;
    }

    .ring-progress.healthy {
      stroke: var(--bms-success, #4CAF50);
    }

    .ring-progress.warning {
      stroke: var(--bms-warning, #FF9800);
    }

    .ring-progress.critical {
      stroke: var(--bms-error, #F44336);
    }

    .ring-progress.alarm {
      stroke: var(--bms-error, #F44336);
      animation: alarm-pulse 1s ease-in-out infinite;
    }

    @keyframes alarm-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .soc-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .soc-value {
      font-size: 28px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .soc-label {
      font-size: 12px;
      color: var(--secondary-text-color);
      text-transform: uppercase;
    }

    .soc-remaining {
      font-size: 14px;
      color: var(--secondary-text-color);
      margin-top: 4px;
    }
  `;

  protected render() {
    const soc = this.soc ?? 0;
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (soc / 100) * circumference;
    const ringClass = this._getRingClass(soc);

    return html`
      <div class="soc-container">
        <svg viewBox="0 0 140 140">
          <circle class="ring-bg" cx="70" cy="70" r="${radius}" />
          <circle
            class="ring-progress ${ringClass}"
            cx="70"
            cy="70"
            r="${radius}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
          />
        </svg>
        <div class="soc-text">
          <div class="soc-label">SOC</div>
          <div class="soc-value">${soc.toFixed(1)}%</div>
          ${this.remaining !== null ? html`
            <div class="soc-remaining">${this.remaining.toFixed(1)} Ah</div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private _getRingClass(soc: number): string {
    if (this.hasAlarm) return 'alarm';
    if (soc <= 10) return 'critical';
    if (soc <= 20) return 'warning';
    return 'healthy';
  }
}
```

### Alert Badge Component

```typescript
// src/components/alert-badge.ts
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("bms-alert-badge")
export class BMSAlertBadge extends LitElement {
  @property({ type: String }) label = "";
  @property({ type: String }) severity: "warning" | "critical" = "warning";

  static styles = css`
    :host {
      display: inline-block;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge.warning {
      background: var(--bms-warning-container, #FFE0B2);
      color: var(--bms-warning, #FF9800);
    }

    .badge.critical {
      background: var(--bms-error-container, #FFCDD2);
      color: var(--bms-error, #F44336);
      animation: badge-pulse 1.5s ease-in-out infinite;
    }

    @keyframes badge-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .icon {
      width: 12px;
      height: 12px;
      margin-right: 4px;
    }
  `;

  protected render() {
    return html`
      <span class="badge ${this.severity}">
        <svg class="icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16" />
        </svg>
        ${this.label}
      </span>
    `;
  }
}
```

---

## Types Definition

```typescript
// src/types.ts
export interface BMSCardConfig {
  title: string;
  cells: CellConfig;
  thresholds: Thresholds;
  temperature: TemperatureConfig;
  display: DisplayConfig;
  entity_pattern?: EntityPattern;
  entities: EntityConfig;
}

export interface CellConfig {
  count: number;
  columns: number;
  layout: "incremental" | "bank";
  orientation: "horizontal" | "vertical";
}

export interface Thresholds {
  cell_min: number;
  cell_low: number;
  cell_high: number;
  cell_max: number;
  delta_warning: number;
  delta_critical: number;
}

export interface TemperatureConfig {
  warning: number;
  critical: number;
}

export interface DisplayConfig {
  delta_unit: "mV" | "V";
  show_power: boolean;
  show_temperatures: boolean;
  show_cycle_count: boolean;
  show_capacity: boolean;
  compact_mode: boolean;
}

export interface EntityPattern {
  prefix: string;
}

export interface EntityConfig {
  // Core sensors
  soc?: string;
  voltage?: string;
  current?: string;
  power?: string;  // Optional - calculated from voltage × current if missing
  capacity_remaining?: string;
  capacity_full?: string;
  cycle_count?: string;
  
  // Derived values (optional - calculated from cell voltages if missing)
  delta_voltage?: string;
  average_cell_voltage?: string;
  min_cell_voltage?: string;
  max_cell_voltage?: string;
  
  // Temperature sensors
  temp_mos?: string;
  temp_env?: string;
  temp_cells?: string[];
  cell_voltages?: string[] | { pattern: string };
  cell_balancing?: { pattern: string };
  charging?: string;
  discharging?: string;
  balancing_active?: string;
  heater?: string;
  alarms?: AlarmConfig[];
}

export interface AlarmConfig {
  entity: string;
  label: string;
  severity: "warning" | "critical";
}

export interface CellData {
  number: number;
  voltage: number | null;
  balancing: boolean;
}

export interface BMSState {
  soc: number | null;
  voltage: number | null;
  current: number | null;
  power: number | null;
  capacityRemaining: number | null;
  capacityFull: number | null;
  cycleCount: number | null;
  
  tempMos: number | null;
  tempEnv: number | null;
  tempCells: (number | null)[];
  
  cells: CellData[];
  
  // Derived values (from sensors or calculated)
  minVoltage: number | null;
  maxVoltage: number | null;
  deltaVoltage: number | null;
  averageCellVoltage: number | null;
  minCellNumber: number | null;  // Which cell has lowest voltage
  maxCellNumber: number | null;  // Which cell has highest voltage
  
  isCharging: boolean;
  isDischarging: boolean;
  isBalancing: boolean;
  heaterOn: boolean;
  
  activeAlarms: Array<{ label: string; severity: string }>;
}
```

---

## Example Configurations

### Minimal Config (using template patterns)

```yaml
type: custom:generic-bms-card
title: "Pack 1"
entity_pattern:
  prefix: "pack_1"
cells:
  count: 16
```

### Full Config with Your Entities

```yaml
type: custom:generic-bms-card
title: "Jakiper Pack 1"

cells:
  count: 16
  columns: 2
  layout: bank
  orientation: horizontal

thresholds:
  cell_min: 2.8
  cell_low: 3.0
  cell_high: 3.45
  cell_max: 3.65
  delta_warning: 20
  delta_critical: 50

temperature:
  warning: 40
  critical: 50

display:
  delta_unit: mV
  show_power: true
  show_temperatures: true
  show_cycle_count: true
  show_capacity: true
  compact_mode: false

entity_pattern:
  prefix: "pack_1"

entities:
  # Override any auto-generated entities if needed
  soc: sensor.pack_1_battery_soc
  voltage: sensor.pack_1_battery_voltage
  current: sensor.pack_1_battery_current
  power: sensor.pack_1_battery_power
  capacity_remaining: sensor.pack_1_remaining_capacity
  capacity_full: sensor.pack_1_battery_full_capacity
  cycle_count: sensor.pack_1_cycle_count
  
  temp_mos: sensor.pack_1_mos_temp
  temp_env: sensor.pack_1_env_temp
  temp_cells:
    - sensor.pack_1_cell_temp_1_4
    - sensor.pack_1_cell_temp_5_8
    - sensor.pack_1_cell_temp_9_12
    - sensor.pack_1_cell_temp_13_16
  
  cell_voltages:
    pattern: "sensor.pack_{prefix}_cell_{n}_voltage"
  
  charging: binary_sensor.pack_1_charge_mos
  discharging: binary_sensor.pack_1_discharge_mos
  
  alarms:
    - entity: binary_sensor.pack_1_cell_ovp
      label: "Cell OVP"
      severity: critical
    - entity: binary_sensor.pack_1_cell_uvp
      label: "Cell UVP"
      severity: critical
    - entity: binary_sensor.pack_1_pack_uvp
      label: "Pack UVP"
      severity: critical
    - entity: binary_sensor.pack_1_dsg_ocp
      label: "Discharge OCP"
      severity: critical
    - entity: binary_sensor.pack_1_chg_ocp
      label: "Charge OCP"
      severity: critical
    - entity: binary_sensor.pack_1_scp_protection
      label: "Short Circuit"
      severity: critical
    - entity: binary_sensor.pack_1_mos_otp
      label: "MOS Over Temp"
      severity: warning
    - entity: binary_sensor.pack_1_env_otp
      label: "Env Over Temp"
      severity: warning
    - entity: binary_sensor.pack_1_alarm_soc_low
      label: "Low SOC"
      severity: warning
    - entity: binary_sensor.pack_1_bms_cell_fault
      label: "Cell Fault"
      severity: critical
```

---

## Build Configuration

### package.json

```json
{
  "name": "generic-bms-card",
  "version": "1.0.0",
  "description": "A generic BMS card for Home Assistant",
  "main": "dist/generic-bms-card.js",
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -c --watch",
    "lint": "eslint src/**/*.ts"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^25.0.0",
    "@rollup/plugin-node-resolve": "^15.0.0",
    "@rollup/plugin-terser": "^0.4.0",
    "@rollup/plugin-typescript": "^11.0.0",
    "lit": "^3.0.0",
    "rollup": "^4.0.0",
    "typescript": "^5.0.0",
    "custom-card-helpers": "^1.9.0"
  },
  "dependencies": {
    "lit": "^3.0.0"
  }
}
```

### rollup.config.js

```javascript
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/generic-bms-card.ts",
  output: {
    file: "dist/generic-bms-card.js",
    format: "es",
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    terser(),
  ],
};
```

### hacs.json

```json
{
  "name": "Generic BMS Card",
  "render_readme": true,
  "homeassistant": "2023.0.0"
}
```

---

## Implementation Notes for Copilot

### Key Implementation Details

1. **LitElement Base**: Use LitElement 3.x for reactive updates and efficient re-rendering

2. **Custom Card Helpers**: Import from `custom-card-helpers` for HA types and utilities

3. **State Change Detection**: Only re-render when relevant entity states change (see `shouldUpdate`)

4. **Entity Resolution**: Template patterns are resolved once on config change, not on every render

5. **CSS Custom Properties**: Use HA theme variables where available, fall back to card-defined variables

6. **Animations**: Keep animations subtle (pulse for alarms, smooth transitions for values)

7. **Accessibility**: Include proper ARIA labels for screen readers

8. **Error Handling**: Gracefully handle missing entities (show "---" or hide sections)

### Material You Guidelines

1. **Surfaces**: Use `ha-card` background with subtle elevation
2. **Typography**: Follow Material type scale (no smaller than 12sp)
3. **Color**: 
   - Use theme primary for accents
   - Semantic colors for status (success/warning/error)
   - Avoid pure black/white - use surface colors
4. **Motion**: 300ms standard easing for transitions
5. **Shape**: Rounded corners (16px card, 12px sections, 8px elements)
6. **Spacing**: 8px grid alignment

### Testing Checklist

- [ ] Card renders with minimal config
- [ ] Template patterns resolve correctly
- [ ] Explicit entity overrides work
- [ ] Cell grid layouts correctly (bank vs incremental)
- [ ] Different cell counts work (8, 16, 24, 32)
- [ ] Alerts display and pulse when active
- [ ] Colors respond to voltage thresholds
- [ ] Balancing indicator shows for active cells
- [ ] Dark/light mode themes work
- [ ] Compact mode reduces padding appropriately
- [ ] Missing entities don't break the card
- [ ] Visual editor generates valid config
