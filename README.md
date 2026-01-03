# HA BMS Card for Home Assistant

A custom Lovelace card for displaying Battery Management System (BMS) data in Home Assistant. Works with any BMS that exposes sensors to Home Assistant (JK-BMS, Jakiper/Pylon, Daly, etc.).

![HA BMS Card Screenshot](docs/examples/screenshots/bms-card-screenshot.png)

## Features

- 🔋 **Circular SOC gauge** with remaining capacity display
- ⚡ **Charge/discharge status indicators** with animated flow
- 📊 **Stats section** showing voltage, current, power, temperatures, delta voltage, cycle count
- 🔌 **Cell voltage grid** with:
  - Configurable columns (1-4) and layout modes (incremental/bank)
  - Color-coded progress bars based on voltage thresholds
  - Min/max cell highlighting
  - Balancing indicator (pulsing dot) for cells actively balancing
- ⚠️ **Alert badges** for multiple alarm/warning entities with severity levels
- 🌡️ **Temperature sensor display**
- 🎨 **Material You design** following Google's Material You design language
- 🌙 **Dark/light mode** support via Home Assistant themes

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Go to "Frontend" section
3. Click the three dots menu and select "Custom repositories"
4. Add `https://github.com/bradmatt275/ha-bms-card` as a "Lovelace" repository
5. Click "Install"
6. Refresh your browser

### Manual Installation

1. Download `ha-bms-card.js` from the [latest release](https://github.com/bradmatt275/ha-bms-card/releases)
2. Copy to `config/www/ha-bms-card.js`
3. Add to your Lovelace resources:

```yaml
resources:
  - url: /local/ha-bms-card.js
    type: module
```

## Configuration

### Minimal Configuration

```yaml
type: custom:ha-bms-card
title: "Pack 1"
entity_pattern:
  prefix: "pack_1"
cells:
  count: 16
```

### Full Configuration

```yaml
type: custom:ha-bms-card
title: "Jakiper Pack 1"

cells:
  count: 16           # 4, 8, 16, 24, or 32
  columns: 2          # 1, 2, 3, or 4
  layout: bank        # 'incremental' or 'bank'
  orientation: horizontal

thresholds:
  cell_min: 2.8       # Below this = critical (red)
  cell_low: 3.0       # Below this = warning (orange)
  cell_high: 3.45     # Above this = warning (orange)
  cell_max: 3.65      # Above this = critical (purple)
  delta_warning: 20   # Delta mV warning threshold
  delta_critical: 50  # Delta mV critical threshold

temperature:
  warning: 40         # °C - show warning color
  critical: 50        # °C - show critical color

display:
  delta_unit: mV      # 'mV' or 'V'
  show_power: true
  show_temperatures: true
  show_cycle_count: true
  show_capacity: true
  compact_mode: false

entity_pattern:
  prefix: "pack_1"

# Optional: Override auto-generated entity IDs
entities:
  soc: sensor.pack_1_battery_soc
  voltage: sensor.pack_1_battery_voltage
  current: sensor.pack_1_battery_current
  power: sensor.pack_1_battery_power
  capacity_remaining: sensor.pack_1_remaining_capacity
  temp_mos: sensor.pack_1_mos_temp
  temp_env: sensor.pack_1_env_temp
  charging: binary_sensor.pack_1_charge_mos
  discharging: binary_sensor.pack_1_discharge_mos
  
  # Alarms (optional array)
  alarms:
    - entity: binary_sensor.pack_1_cell_ovp
      label: "Cell OVP"
      severity: critical
    - entity: binary_sensor.pack_1_cell_uvp
      label: "Cell UVP"
      severity: critical
    - entity: binary_sensor.pack_1_mos_otp
      label: "MOS Over Temp"
      severity: warning
```

## Alerts & Alarms

The card monitors BMS alarm/fault entities and displays active alerts in the header.

### Default Alarms

When using `entity_pattern.prefix`, the card automatically monitors these alarms:

| Alarm | Entity Pattern | Severity |
|-------|---------------|----------|
| Cell OVP | `binary_sensor.{prefix}_cell_ovp` | Critical |
| Cell UVP | `binary_sensor.{prefix}_cell_uvp` | Critical |
| Pack UVP | `binary_sensor.{prefix}_pack_uvp` | Critical |
| Discharge OCP | `binary_sensor.{prefix}_dsg_ocp` | Critical |
| Charge OCP | `binary_sensor.{prefix}_chg_ocp` | Critical |
| Short Circuit | `binary_sensor.{prefix}_scp_protection` | Critical |
| MOS Over Temp | `binary_sensor.{prefix}_mos_otp` | Critical |
| Env Over Temp | `binary_sensor.{prefix}_env_otp` | Warning |
| Cell Fault | `binary_sensor.{prefix}_bms_cell_fault` | Critical |
| NTC Fault | `binary_sensor.{prefix}_bms_ntc_fault` | Critical |
| Low SOC | `binary_sensor.{prefix}_alarm_soc_low` | Warning |
| Low Battery | `binary_sensor.{prefix}_battery_low_power` | Warning |

### Custom Alarms

Override or add to the defaults in your config:

```yaml
entities:
  alarms:
    - entity: binary_sensor.pack_1_cell_ovp
      label: "Cell OVP"
      severity: critical
    - entity: binary_sensor.pack_1_alarm_soc_low
      label: "Low SOC"
      severity: warning
```

## Entity Configuration Modes

### Template Pattern Mode

Use `entity_pattern.prefix` to auto-generate entity IDs:

```yaml
entity_pattern:
  prefix: "pack_1"
```

This will look for entities like:
- `sensor.pack_1_battery_soc`
- `sensor.pack_1_battery_voltage`
- `sensor.pack_1_cell_1_voltage`
- etc.

### Explicit Entity Mode

Override any auto-generated entity in the `entities` block:

```yaml
entities:
  soc: sensor.my_custom_soc_entity
  voltage: sensor.my_custom_voltage_entity
```

## Cell Grid Layouts

### Bank Mode (default)
Cells are split into columns. For 16 cells with 2 columns:
- Column 1: Cells 1-8
- Column 2: Cells 9-16

### Incremental Mode
Cells flow left-to-right, top-to-bottom:
```
1  2  3  4
5  6  7  8
...
```

## Calculated Values

Some values can come from sensors OR be calculated automatically:

| Value | Calculation | Sensor Override |
|-------|-------------|-----------------|
| Delta Voltage | `max(cells) - min(cells)` | `entities.delta_voltage` |
| Average Cell | `sum(cells) / count` | `entities.average_cell_voltage` |
| Power | `voltage × current` | `entities.power` |

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch mode for development
npm run watch
```

## Acknowledgements

This project was inspired by [syssi/esphome-jk-bms](https://github.com/syssi/esphome-jk-bms).

## License

MIT License - see [LICENSE](LICENSE) for details.
