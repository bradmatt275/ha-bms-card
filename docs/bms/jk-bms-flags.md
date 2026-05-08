# iBMS Alarm Bitmask Reference

Decodes the 2-byte alarm bitmask reported by the BMS at protocol address `0x8B` (Battery Warning Message).

## Alarm bits (`0x8B`)

| Bit | Value (dec) | Value (hex) | Severity | Alarm | Original protocol name |
|-----|-------------|-------------|----------|-------|------------------------|
| 0   | 1           | 0x0001      | Warning  | Low state of charge | Low capacity alarm |
| 1   | 2           | 0x0002      | Error    | MOSFET over-temperature | MOS tube over-temperature alarm |
| 2   | 4           | 0x0004      | Warning  | Charge over-voltage (pack) | Charge over-voltage alarm |
| 3   | 8           | 0x0008      | Warning  | Discharge under-voltage (pack) | Discharge under-voltage alarm |
| 4   | 16          | 0x0010      | Error    | Battery over-temperature | Battery over-temperature alarm |
| 5   | 32          | 0x0020      | Error    | Charge over-current | Charge over-current alarm |
| 6   | 64          | 0x0040      | Error    | Discharge over-current | Discharge over-current alarm |
| 7   | 128         | 0x0080      | Warning  | Cell voltage imbalance | Cell differential pressure alarm |
| 8   | 256         | 0x0100      | Warning  | Enclosure over-temperature | Battery box over-temperature alarm |
| 9   | 512         | 0x0200      | Warning  | Battery low-temperature | Battery low-temperature alarm |
| 10  | 1024        | 0x0400      | Error    | Cell over-voltage | Cell over-voltage alarm |
| 11  | 2048        | 0x0800      | Error    | Cell under-voltage | Cell under-voltage alarm |
| 12  | 4096        | 0x1000      | Error    | Hardware protection trip (primary) | 309_A protection |
| 13  | 8192        | 0x2000      | Error    | Hardware protection trip (secondary) | 309_B protection |
| 14  | 16384       | 0x4000      | —        | Reserved | Reserved |
| 15  | 32768       | 0x8000      | —        | Reserved | Reserved |

For each bit, `1` = alarm active, `0` = normal.

The protocol itself bundles all bits under one "Battery Warning Message" register without a built-in severity field — the Severity column is a practical classification, not part of the spec. **Errors** correspond to conditions where the BMS will typically have already opened its MOSFETs (cell-level trips, over-current, over-temperature, hardware protection latches). **Warnings** are pack-level or environmental thresholds that are usually configured below the hardware protection points to give early notice. Cross-check against `0x8C` (MOSFET status) on a few real events to confirm how your specific BMS firmware behaves.

## Decoding example

```
4098 = 0x1002 = 0001 0000 0000 0010
                          │           │
                          └─ bit 1   └─ bit 12
```

`4098` = **MOS tube over-temperature** + **309_A protection** active simultaneously.

## Related status field (`0x8C`)

The Battery status information field uses the same 2-byte bitmask layout:

| Bit | Value | Meaning |
|-----|-------|---------|
| 0   | 0x0001 | Charging MOS — `1` on, `0` off |
| 1   | 0x0002 | Discharging MOS — `1` on, `0` off |
| 2   | 0x0004 | Balancing — `1` on, `0` off |
| 3   | 0x0008 | Battery — `1` normal, `0` dropped |
| 4–15 |       | Reserved |

## Home Assistant template sensors

Three sensors that together drive a card cleanly: an overall **Status** (OK / Warning / Error) for the icon and color, plus separate **Active Errors** and **Active Warnings** sensors that list the specific conditions firing. Replace `sensor.ibms_alarm_bitmask` with whatever your iBMS integration exposes the raw bitmask as.

```yaml
template:
  - sensor:
      # Overall status — drives the card's icon/color
      - name: "iBMS Status"
        state: >
          {% set v = states('sensor.ibms_alarm_bitmask') | int(0) %}
          {% set error_mask = 15474 %}
          {{ 'OK' if v == 0
             else ('Error' if v | bitwise_and(error_mask) else 'Warning') }}
        icon: >
          {% set v = states('sensor.ibms_alarm_bitmask') | int(0) %}
          {% set error_mask = 15474 %}
          {{ 'mdi:check-circle' if v == 0
             else ('mdi:alert-octagon' if v | bitwise_and(error_mask) else 'mdi:alert') }}

      # Active errors — MOSFETs likely off, immediate attention
      - name: "iBMS Active Errors"
        state: >
          {% set v = states('sensor.ibms_alarm_bitmask') | int(0) %}
          {% set errors = [
            (2,    'MOSFET over-temp'),
            (16,   'Battery over-temp'),
            (32,   'Charge over-current'),
            (64,   'Discharge over-current'),
            (1024, 'Cell over-voltage'),
            (2048, 'Cell under-voltage'),
            (4096, 'Hardware protection (primary)'),
            (8192, 'Hardware protection (secondary)')
          ] %}
          {% set active = errors | selectattr('0', 'bitwise_and', v) | map(attribute='1') | list %}
          {{ 'None' if active | count == 0 else active | join(', ') }}
        attributes:
          count: >
            {% set v = states('sensor.ibms_alarm_bitmask') | int(0) %}
            {{ [2,16,32,64,1024,2048,4096,8192] | select('bitwise_and', v) | list | count }}
        icon: mdi:alert-octagon

      # Active warnings — operating outside normal range, monitor
      - name: "iBMS Active Warnings"
        state: >
          {% set v = states('sensor.ibms_alarm_bitmask') | int(0) %}
          {% set warnings = [
            (1,   'Low state of charge'),
            (4,   'Charge over-voltage'),
            (8,   'Discharge under-voltage'),
            (128, 'Cell voltage imbalance'),
            (256, 'Enclosure over-temp'),
            (512, 'Battery low-temp')
          ] %}
          {% set active = warnings | selectattr('0', 'bitwise_and', v) | map(attribute='1') | list %}
          {{ 'None' if active | count == 0 else active | join(', ') }}
        attributes:
          count: >
            {% set v = states('sensor.ibms_alarm_bitmask') | int(0) %}
            {{ [1,4,8,128,256,512] | select('bitwise_and', v) | list | count }}
        icon: mdi:alert
```

The magic numbers: `15474` is the OR of every error bit (`2 + 16 + 32 + 64 + 1024 + 2048 + 4096 + 8192`); the warning OR is `909` (`1 + 4 + 8 + 128 + 256 + 512`). If you prefer to keep the masks self-documenting, swap `15474` for the explicit sum in the templates above.

### Lovelace card hint

With these three sensors in place, a conditional-card setup gets clean:

- Show a green `mdi:check-circle` when `iBMS Status` is `OK`
- Show `iBMS Active Warnings` (yellow) when status is `Warning`
- Show `iBMS Active Errors` (red) when status is `Error` — and consider an automation that pushes a notification on any `Error` state change

## Source

Extracted from *Communication protocol between monitoring platform and BMS*, address `0x8B` (Battery Warning Message), version V2.5 (2020-12-17).
