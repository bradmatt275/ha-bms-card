# HA BMS Card for Home Assistant

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

#### Custom Status Colors
| Variable | Color | Usage |
|----------|-------|-------|
| \`--bms-success\` | #4CAF50 (Green 500) | Healthy state |
| \`--bms-success-container\` | #C8E6C9 (Green 100) | Success background |
| \`--bms-warning\` | #FF9800 (Orange 500) | Warning state |
| \`--bms-warning-container\` | #FFE0B2 (Orange 100) | Warning background |
| \`--bms-error\` | #F44336 (Red 500) | Error/alarm state |
| \`--bms-error-container\` | #FFCDD2 (Red 100) | Error background |
| \`--bms-info\` | #2196F3 (Blue 500) | Informational |
| \`--bms-info-container\` | #BBDEFB (Blue 100) | Info background |
| \`--bms-cell-low\` | #F44336 | Below min threshold |
| \`--bms-cell-nominal\` | #4CAF50 | Within normal range |
| \`--bms-cell-high\` | #FF9800 | Approaching max threshold |
| \`--bms-cell-critical\` | #9C27B0 | Above max threshold |
| \`--bms-balancing\` | #00BCD4 (Cyan 500) | Balancing indicator |

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

\`\`\`yaml
type: custom:ha-bms-card
title: "Pack 1"

# Cell Configuration
cells:
  count: 16                    # 4, 8, 16, 24, or 32
  columns: 2                   # 1, 2, 3, or 4 (desktop)
  columns_mobile: 1            # 1, 2, 3, or 4 (mobile, optional)
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
  delta_voltage: sensor.pack_1_delta_voltage
  average_cell_voltage: sensor.pack_1_avg_cell_voltage
  min_cell_voltage: sensor.pack_1_min_cell_voltage
  max_cell_voltage: sensor.pack_1_max_cell_voltage
  
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
  
  # Cell balancing status (optional - array of binary sensors)
  cell_balancing:
    pattern: "binary_sensor.{prefix}_cell_{n}_balancing"
  
  # System status
  charging: binary_sensor.pack_1_charge_mos
  discharging: binary_sensor.pack_1_discharge_mos
  balancing_active: binary_sensor.pack_1_balancing
  heater: binary_sensor.pack_1_heater
  
  # Alarms/Warnings (array - all monitored for active state)
  alarms:
    - entity: binary_sensor.pack_1_cell_ovp
      label: "Cell OVP"
      severity: critical
    - entity: binary_sensor.pack_1_cell_uvp
      label: "Cell UVP"
      severity: critical
\`\`\`

### Calculated vs Sensor Values

For certain metrics, the card supports both explicit sensor entities AND automatic calculation from available data. If a sensor is specified, it takes priority. If not, the card calculates the value.

| Metric | Calculation Method | Sensor Override |
|--------|-------------------|-----------------|
| Delta Voltage | \`max(cell_voltages) - min(cell_voltages)\` | \`entities.delta_voltage\` |
| Average Cell Voltage | \`sum(cell_voltages) / cell_count\` | \`entities.average_cell_voltage\` |
| Min Cell Voltage | \`min(cell_voltages)\` | \`entities.min_cell_voltage\` |
| Max Cell Voltage | \`max(cell_voltages)\` | \`entities.max_cell_voltage\` |
| Min Cell Number | Index of lowest voltage cell | (derived only) |
| Max Cell Number | Index of highest voltage cell | (derived only) |
| Power | \`voltage × current\` | \`entities.power\` |

### Default Entity Templates

When using \`entity_pattern.prefix\`, the card auto-generates entity IDs using these template patterns:

#### Core Sensors
| Key | Template Pattern |
|-----|-----------------|
| soc | \`sensor.{prefix}_battery_soc\` |
| voltage | \`sensor.{prefix}_battery_voltage\` |
| current | \`sensor.{prefix}_battery_current\` |
| power | \`sensor.{prefix}_battery_power\` |
| capacity_remaining | \`sensor.{prefix}_remaining_capacity\` |
| capacity_full | \`sensor.{prefix}_battery_full_capacity\` |
| cycle_count | \`sensor.{prefix}_cycle_count\` |

#### Temperature Sensors
| Key | Template Pattern |
|-----|-----------------|
| temp_mos | \`sensor.{prefix}_mos_temp\` |
| temp_env | \`sensor.{prefix}_env_temp\` |
| temp_cell_pattern | \`sensor.{prefix}_cell_temp_{range}\` |

#### Cell Sensors
| Key | Template Pattern |
|-----|-----------------|
| cell_voltage_pattern | \`sensor.{prefix}_cell_{n}_voltage\` |
| cell_balancing_pattern | \`binary_sensor.{prefix}_cell_{n}_balancing\` |

#### Binary Status Sensors
| Key | Template Pattern |
|-----|-----------------|
| charging | \`binary_sensor.{prefix}_charge_mos\` |
| discharging | \`binary_sensor.{prefix}_discharge_mos\` |
| heater | \`binary_sensor.{prefix}_heater\` |
| balancing_active | \`binary_sensor.{prefix}_balancing\` |

### Default Alarm Templates

When a prefix is configured, these alarms are auto-generated and monitored by default:

| Alarm Key | Template Pattern | Label | Severity |
|-----------|-----------------|-------|----------|
| cell_ovp | \`binary_sensor.{prefix}_cell_ovp\` | Cell OVP | critical |
| cell_uvp | \`binary_sensor.{prefix}_cell_uvp\` | Cell UVP | critical |
| pack_ovp | \`binary_sensor.{prefix}_pack_ovp\` | Pack OVP | critical |
| pack_uvp | \`binary_sensor.{prefix}_pack_uvp\` | Pack UVP | critical |
| discharge_ocp | \`binary_sensor.{prefix}_discharge_ocp\` | Discharge OCP | critical |
| charge_ocp | \`binary_sensor.{prefix}_charge_ocp\` | Charge OCP | critical |
| scp | \`binary_sensor.{prefix}_short_circuit_protection\` | Short Circuit | critical |
| mos_otp | \`binary_sensor.{prefix}_mos_overtemperature_protection\` | MOS OTP | warning |
| charge_otp | \`binary_sensor.{prefix}_charging_overtemperature_protection\` | Charge OTP | warning |
| discharge_otp | \`binary_sensor.{prefix}_discharging_overtemperature_protection\` | Discharge OTP | warning |
| charge_utp | \`binary_sensor.{prefix}_charging_undertemperature_protection\` | Charge UTP | warning |
| discharge_utp | \`binary_sensor.{prefix}_discharging_undertemperature_protection\` | Discharge UTP | warning |
| soc_low | \`binary_sensor.{prefix}_low_capacity_alarm\` | Low SOC | warning |
| cell_fault | \`binary_sensor.{prefix}_cell_request_charge_voltage_failure_alarm\` | Cell Fault | critical |

#### Alarm Overrides

Individual default alarms can be overridden or disabled using the \`alarm_overrides\` configuration:

\`\`\`yaml
entities:
  alarm_overrides:
    cell_ovp: binary_sensor.custom_cell_ovp_entity  # Override entity
    soc_low: ""  # Disable this alarm (empty string)
\`\`\`

---

## Component Architecture

### File Structure

\`\`\`
ha-bms-card/
├── dist/
│   └── ha-bms-card.js          # Bundled output
├── src/
│   ├── ha-bms-card.ts          # Main card class
│   ├── editor.ts               # Visual config editor (6 tabs)
│   ├── types.ts                # TypeScript interfaces
│   ├── const.ts                # Constants, defaults & alarm templates
│   ├── styles.ts               # CSS-in-JS styles
│   ├── entity-resolver.ts      # Template pattern resolution
│   │
│   ├── components/
│   │   ├── soc-ring.ts         # Circular SOC gauge (clickable)
│   │   ├── status-indicator.ts # Charge/discharge icons with animations
│   │   ├── stat-card.ts        # Voltage/current/temp cards (clickable)
│   │   ├── cell-grid.ts        # Cell voltage display (clickable cells)
│   │   ├── alert-badge.ts      # Alert indicator badges
│   │   └── temp-bar.ts         # Temperature sensor display
│   │
│   └── utils/
│       ├── format.ts           # Number formatting
│       └── threshold.ts        # Threshold evaluation
│
├── docs/
│   ├── bms-card-design-spec.md # This design document
│   └── examples/               # Example configs and screenshots
│
├── package.json
├── rollup.config.js
├── tsconfig.json
├── hacs.json
├── LICENSE
└── README.md
\`\`\`

### Component Descriptions

#### Main Card (\`ha-bms-card.ts\`)
- Extends LitElement, implements LovelaceCard interface
- Manages configuration parsing and validation
- Coordinates state updates from Home Assistant
- Orchestrates child component rendering

#### Entity Resolver (\`entity-resolver.ts\`)
- Resolves entity IDs from templates using \`{prefix}\` and \`{n}\` placeholders
- Prioritizes explicit config over template patterns
- Caches resolved entities for performance
- Detects relevant state changes for efficient re-rendering

#### Visual Editor (\`editor.ts\`)
- 6-tab configuration interface:
  1. **General**: Title, cell count/columns/layout
  2. **Entities**: Core entity pickers with prefix pattern
  3. **Cells**: Cell voltage/balancing entity overrides
  4. **Thresholds**: Voltage and temperature limits
  5. **Display**: Visibility toggles and formatting options
  6. **Alerts**: Default alarm overrides and custom alarms

#### SOC Ring (\`soc-ring.ts\`)
- Circular progress indicator for state of charge
- Color changes based on SOC level and alarm state
- Displays remaining capacity in Ah
- Clickable to open entity more-info dialog

#### Cell Grid (\`cell-grid.ts\`)
- Displays all cell voltages in configurable grid layout
- Supports "bank" (column-first) and "incremental" (row-first) ordering
- Color-coded voltage bars based on thresholds
- Balancing indicator animation for active cells
- Highlights min/max voltage cells
- Clickable cells open entity more-info dialog

#### Status Indicator (\`status-indicator.ts\`)
- Animated icons for charge/discharge states
- Pulses when active
- Clickable to open entity more-info dialog

#### Alert Badge (\`alert-badge.ts\`)
- Compact alarm indicators in card header
- Warning (orange) and critical (red) severity levels
- Pulsing animation for critical alarms

#### Stat Card (\`stat-card.ts\`)
- Displays key metrics (voltage, current, power, temps)
- Supports warning/critical state colors
- Clickable to open entity more-info dialog

---

## Visual Editor

The card includes a comprehensive visual configuration editor accessible through the Home Assistant UI. The editor is organized into 6 tabs:

### Tab 1: General
- Card title
- Cell configuration (count, columns, mobile columns, layout, orientation)

### Tab 2: Entities
- Entity prefix pattern for auto-generation
- Core entity pickers (SOC, voltage, current, power, etc.)
- Temperature sensor configuration

### Tab 3: Cells
- Per-cell voltage entity overrides
- Per-cell balancing entity overrides

### Tab 4: Thresholds
- Cell voltage thresholds (min, low, high, max)
- Delta voltage warning/critical thresholds
- Temperature warning/critical thresholds

### Tab 5: Display
- Delta unit selection (mV or V)
- Visibility toggles (power, temperatures, cycle count, capacity)
- Compact mode toggle

### Tab 6: Alerts
- Default alarm entity overrides grid
- Custom alarm configuration (add/remove/edit)

---

## Entity Click Behavior

All clickable elements fire Home Assistant's \`hass-more-info\` event to open the entity's more-info dialog:

| Component | Clickable Element | Entity Used |
|-----------|------------------|-------------|
| SOC Ring | Entire ring | \`soc\` entity |
| Stat Card | Each stat | Corresponding entity |
| Cell Grid | Individual cells | Cell voltage entity |
| Status Indicator | Charge/discharge icons | \`charging\`/\`discharging\` entity |

---

## Implementation Guidelines

### Key Technical Decisions

1. **LitElement 3.x**: Reactive updates and efficient re-rendering
2. **Custom Card Helpers**: Home Assistant types and utilities
3. **State Change Detection**: Only re-render when relevant entities change
4. **Entity Resolution**: Template patterns resolved once on config change
5. **CSS Custom Properties**: HA theme variables with card-defined fallbacks

### Material You Guidelines

1. **Surfaces**: Use \`ha-card\` background with subtle elevation
2. **Typography**: Follow Material type scale (minimum 12sp)
3. **Color**: Theme primary for accents, semantic colors for status
4. **Motion**: 300ms standard easing for transitions
5. **Shape**: Rounded corners (16px card, 12px sections, 8px elements)
6. **Spacing**: 8px grid alignment

### Animations

- **Balancing Indicator**: Pulse animation (1.5s ease-in-out infinite)
- **Critical Alarms**: Pulse animation for alert badges
- **Value Transitions**: 300ms smooth transitions for gauge fills
- **Status Indicators**: Pulse when charge/discharge active

### Error Handling

- Missing entities display "---" or hide sections gracefully
- Invalid configuration shows helpful error messages
- Card renders partial data when some entities unavailable

---

## Testing Checklist

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
- [ ] Entity clicks open more-info dialogs
- [ ] Mobile column layout works
- [ ] Default alarms auto-generate from prefix
- [ ] Alarm overrides disable/replace defaults
