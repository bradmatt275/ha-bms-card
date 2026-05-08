# PACE BMS Flag Reference

Decodes the three 16-bit flag registers reported over Modbus by PACE BMS units:

- `0x0009` — **Warning flag** — early threshold alerts
- `0x0010` — **Protection flag** — hardware protection trips (MOSFETs typically opened)
- `0x0011` — **Status/Fault flag** — low byte = hardware faults, high byte = pack state

Unlike many cheaper BMS protocols, PACE explicitly separates *warnings* (early threshold alerts) from *protections* (actual trips) at the protocol level — no severity guessing required.

## Warning flag (`0x0009`)

| Bit | Value (dec) | Value (hex) | Alarm | Original protocol name |
|-----|-------------|-------------|-------|------------------------|
| 0   | 1           | 0x0001      | Cell over-voltage | Battery cell overvoltage alarm |
| 1   | 2           | 0x0002      | Cell under-voltage | Battery cell low voltage alarm |
| 2   | 4           | 0x0004      | Pack over-voltage | Battery pack overvoltage alarm |
| 3   | 8           | 0x0008      | Pack under-voltage | Battery pack low voltage alarm |
| 4   | 16          | 0x0010      | Charge over-current | Charging over current alarm |
| 5   | 32          | 0x0020      | Discharge over-current | Discharging over current alarm |
| 6   | 64          | 0x0040      | — | Reserved |
| 7   | 128         | 0x0080      | — | Reserved |
| 8   | 256         | 0x0100      | Charge over-temperature (cell) | Charging high temperature alarm |
| 9   | 512         | 0x0200      | Discharge over-temperature (cell) | Discharging high temperature alarm |
| 10  | 1024        | 0x0400      | Charge under-temperature (cell) | Charging low temperature alarm |
| 11  | 2048        | 0x0800      | Discharge under-temperature (cell) | Discharging low temperature alarm |
| 12  | 4096        | 0x1000      | Environment over-temperature | Environment high temperature alarm |
| 13  | 8192        | 0x2000      | Environment under-temperature | Environment low temperature alarm |
| 14  | 16384       | 0x4000      | MOSFET over-temperature | MOSFET high temperature alarm |
| 15  | 32768       | 0x8000      | Low state of charge | SOC Low alarm |

## Protection flag (`0x0010`)

| Bit | Value (dec) | Value (hex) | Trip | Original protocol name |
|-----|-------------|-------------|------|------------------------|
| 0   | 1           | 0x0001      | Cell over-voltage trip | Battery cell over voltage protection |
| 1   | 2           | 0x0002      | Cell under-voltage trip | Battery cell low voltage protection |
| 2   | 4           | 0x0004      | Pack over-voltage trip | Battery pack over voltage protection |
| 3   | 8           | 0x0008      | Pack under-voltage trip | Battery pack low voltage protection |
| 4   | 16          | 0x0010      | Charge over-current trip | Charging over current protection |
| 5   | 32          | 0x0020      | Discharge over-current trip | Discharging over current protection |
| 6   | 64          | 0x0040      | Short circuit trip | Short circuit protection |
| 7   | 128         | 0x0080      | Charger over-voltage trip | Charger overvoltage protection |
| 8   | 256         | 0x0100      | Charge over-temperature trip (cell) | Charging high temperature protection |
| 9   | 512         | 0x0200      | Discharge over-temperature trip (cell) | Discharging high temperature protection |
| 10  | 1024        | 0x0400      | Charge under-temperature trip (cell) | Charging low temperature protection |
| 11  | 2048        | 0x0800      | Discharge under-temperature trip (cell) | Discharging low temperature protection |
| 12  | 4096        | 0x1000      | MOSFET over-temperature trip | MOSFET high temperature protection |
| 13  | 8192        | 0x2000      | Environment over-temperature trip | Environment high temperature protection |
| 14  | 16384       | 0x4000      | Environment under-temperature trip | Environment low temperature protection |
| 15  | 32768       | 0x8000      | — | Reserved |

## Status/Fault flag (`0x0011`)

This register packs two different things into one word: the low byte (bits 0–7) is hardware **faults**, the high byte (bits 8–15) is informational pack **status**.

| Bit | Value (dec) | Value (hex) | Type | Meaning | Original protocol name |
|-----|-------------|-------------|------|---------|------------------------|
| 0   | 1           | 0x0001      | Fault  | Charge MOSFET fault | charging MOSFET fault |
| 1   | 2           | 0x0002      | Fault  | Discharge MOSFET fault | discharging MOSFET fault |
| 2   | 4           | 0x0004      | Fault  | Temperature sensor fault | temperature sensor fault |
| 3   | 8           | 0x0008      | —      | Reserved | Reserved |
| 4   | 16          | 0x0010      | Fault  | Battery cell fault | battery cell fault |
| 5   | 32          | 0x0020      | Fault  | Front-end sampling fault | front end sampling communication fault |
| 6   | 64          | 0x0040      | —      | Reserved | Reserved |
| 7   | 128         | 0x0080      | —      | Reserved | Reserved |
| 8   | 256         | 0x0100      | Status | Charging | state of charge |
| 9   | 512         | 0x0200      | Status | Discharging | state of discharge |
| 10  | 1024        | 0x0400      | Status | Charge MOSFET on (`0` = off) | charging MOSFET is ON |
| 11  | 2048        | 0x0800      | Status | Discharge MOSFET on (`0` = off) | discharging MOSFET is ON |
| 12  | 4096        | 0x1000      | Status | Charge limiter active | charging Limiter is ON |
| 13  | 8192        | 0x2000      | —      | Reserved | Reserved |
| 14  | 16384       | 0x4000      | Fault* | Charger inversed | charger inversed |
| 15  | 32768       | 0x8000      | Status | Heater on | heater is ON |

*The protocol doc lists "charger inversed" under the Status section, but functionally it's a fault — the charger has been connected backwards. Treat as Fault.

## Severity model

| Severity | Source | Meaning |
|----------|--------|---------|
| **OK** | All registers zero (within their used bits) | Pack operating normally |
| **Warning** | Any bit set in `0x0009` | Threshold crossed, pack still functional, advance notice |
| **Protection** | Any bit set in `0x0010` | Hardware protection has tripped, MOSFETs typically open |
| **Fault** | Any fault bit set in `0x0011` (bits 0–5, 14) | Internal hardware failure or charger reversed |

When multiple severities are active simultaneously, treat **Fault** as the most serious, then Protection, then Warning. A pack can absolutely show all three at once during an event (e.g. cell over-voltage warning bit, then over-voltage protection trip, plus a temperature sensor fault if the AFE is unhappy).

## Home Assistant template sensors

Five sensors. Replace the source sensor names with whatever your Modbus integration exposes the three flag registers as.

```yaml
template:
  - sensor:
      # Overall status — drives the card's icon/color
      - name: "PACE Status"
        state: >
          {% set w = states('sensor.pace_warning_flag')    | int(0) %}
          {% set p = states('sensor.pace_protection_flag') | int(0) %}
          {% set f = states('sensor.pace_fault_flag')      | int(0) | bitwise_and(16439) %}
          {{ 'Fault' if f
             else ('Protection' if p
                   else ('Warning' if w else 'OK')) }}
        icon: >
          {% set w = states('sensor.pace_warning_flag')    | int(0) %}
          {% set p = states('sensor.pace_protection_flag') | int(0) %}
          {% set f = states('sensor.pace_fault_flag')      | int(0) | bitwise_and(16439) %}
          {{ 'mdi:close-octagon'  if f
             else ('mdi:alert-octagon' if p
                   else ('mdi:alert' if w else 'mdi:check-circle')) }}

      # Active warnings
      - name: "PACE Active Warnings"
        state: >
          {% set v = states('sensor.pace_warning_flag') | int(0) %}
          {% set warnings = [
            (1,     'Cell over-voltage'),
            (2,     'Cell under-voltage'),
            (4,     'Pack over-voltage'),
            (8,     'Pack under-voltage'),
            (16,    'Charge over-current'),
            (32,    'Discharge over-current'),
            (256,   'Charge over-temp (cell)'),
            (512,   'Discharge over-temp (cell)'),
            (1024,  'Charge under-temp (cell)'),
            (2048,  'Discharge under-temp (cell)'),
            (4096,  'Environment over-temp'),
            (8192,  'Environment under-temp'),
            (16384, 'MOSFET over-temp'),
            (32768, 'Low state of charge')
          ] %}
          {% set active = warnings | selectattr('0', 'bitwise_and', v) | map(attribute='1') | list %}
          {{ 'None' if active | count == 0 else active | join(', ') }}
        icon: mdi:alert

      # Active protections (trips)
      - name: "PACE Active Protections"
        state: >
          {% set v = states('sensor.pace_protection_flag') | int(0) %}
          {% set trips = [
            (1,     'Cell over-voltage'),
            (2,     'Cell under-voltage'),
            (4,     'Pack over-voltage'),
            (8,     'Pack under-voltage'),
            (16,    'Charge over-current'),
            (32,    'Discharge over-current'),
            (64,    'Short circuit'),
            (128,   'Charger over-voltage'),
            (256,   'Charge over-temp (cell)'),
            (512,   'Discharge over-temp (cell)'),
            (1024,  'Charge under-temp (cell)'),
            (2048,  'Discharge under-temp (cell)'),
            (4096,  'MOSFET over-temp'),
            (8192,  'Environment over-temp'),
            (16384, 'Environment under-temp')
          ] %}
          {% set active = trips | selectattr('0', 'bitwise_and', v) | map(attribute='1') | list %}
          {{ 'None' if active | count == 0 else active | join(', ') }}
        icon: mdi:alert-octagon

      # Active faults (hardware failures)
      - name: "PACE Active Faults"
        state: >
          {% set v = states('sensor.pace_fault_flag') | int(0) %}
          {% set faults = [
            (1,     'Charge MOSFET fault'),
            (2,     'Discharge MOSFET fault'),
            (4,     'Temperature sensor fault'),
            (16,    'Battery cell fault'),
            (32,    'Front-end sampling fault'),
            (16384, 'Charger inversed')
          ] %}
          {% set active = faults | selectattr('0', 'bitwise_and', v) | map(attribute='1') | list %}
          {{ 'None' if active | count == 0 else active | join(', ') }}
        icon: mdi:close-octagon

      # Pack state (informational status, not alarms)
      - name: "PACE Pack State"
        state: >
          {% set v = states('sensor.pace_fault_flag') | int(0) %}
          {% set states_list = [
            (256,   'Charging'),
            (512,   'Discharging'),
            (1024,  'Charge MOSFET on'),
            (2048,  'Discharge MOSFET on'),
            (4096,  'Charge limiter active'),
            (32768, 'Heater on')
          ] %}
          {% set active = states_list | selectattr('0', 'bitwise_and', v) | map(attribute='1') | list %}
          {{ 'Idle' if active | count == 0 else active | join(', ') }}
        icon: mdi:battery-charging
```

The magic number `16439` in the Status sensor is the OR of all fault bits in `0x0011` (`1 + 2 + 4 + 16 + 32 + 16384`) — masking with this prevents the status bits in the high byte from accidentally counting as faults.

### Lovelace card hint

With these five sensors the card structure is straightforward:

- `PACE Status` drives icon and color (green / yellow / orange / red)
- `PACE Pack State` shows what the pack is currently doing — always visible, useful even when everything's OK
- `PACE Active Warnings`, `Active Protections`, `Active Faults` shown conditionally when their respective sensor is anything other than `None`

Recommended automation triggers: any state change on `PACE Active Faults` or `PACE Active Protections` to a non-`None` value should push a notification — those are the cases where the pack has stopped doing its job.

## Source

Extracted from *PACE BMS Modbus Protocol for RS485*, V1.3 (2017-06-27), registers `0x0009`, `0x0010`, and `0x0011`.
