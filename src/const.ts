/**
 * Generic BMS Card - Constants and Defaults
 * Default templates, thresholds, and configuration values
 */

import {
  BMSCardConfig,
  CellConfig,
  Thresholds,
  TemperatureConfig,
  DisplayConfig,
  DefaultTemplates,
} from "./types";

// ============================================================================
// Entity Templates
// ============================================================================

/**
 * Default entity templates using {prefix} placeholder
 * These are used when entity_pattern.prefix is configured
 */
export const DEFAULT_TEMPLATES: DefaultTemplates = {
  // Sensors
  soc: "sensor.{prefix}_battery_soc",
  voltage: "sensor.{prefix}_battery_voltage",
  current: "sensor.{prefix}_battery_current",
  power: "sensor.{prefix}_battery_power",
  capacity_remaining: "sensor.{prefix}_remaining_capacity",
  capacity_full: "sensor.{prefix}_battery_full_capacity",
  cycle_count: "sensor.{prefix}_cycle_count",

  // Derived values (optional - card calculates if not present)
  delta_voltage: "sensor.{prefix}_delta_voltage",
  average_cell_voltage: "sensor.{prefix}_avg_cell_voltage",
  min_cell_voltage: "sensor.{prefix}_min_cell_voltage",
  max_cell_voltage: "sensor.{prefix}_max_cell_voltage",

  // Temperatures
  temp_mos: "sensor.{prefix}_mos_temp",
  temp_env: "sensor.{prefix}_env_temp",
  temp_cell_pattern: "sensor.{prefix}_cell_temp_{range}",

  // Cell voltages
  cell_voltage_pattern: "sensor.{prefix}_cell_{n}_voltage",

  // Cell balancing
  cell_balancing_pattern: "binary_sensor.{prefix}_cell_{n}_balancing",

  // Binary sensors
  charging: "binary_sensor.{prefix}_charge_mos",
  discharging: "binary_sensor.{prefix}_discharge_mos",
  balancing_active: "binary_sensor.{prefix}_balancing",
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
  alarm_soc_low: "binary_sensor.{prefix}_alarm_soc_low",
  alarm_cell_fault: "binary_sensor.{prefix}_bms_cell_fault",
  alarm_ntc_fault: "binary_sensor.{prefix}_bms_ntc_fault",
};

// ============================================================================
// Default Alarms
// ============================================================================

/**
 * Default alarm configurations when using template patterns
 * Users can override these in their config
 */
export const DEFAULT_ALARMS = [
  { key: "alarm_cell_ovp", label: "Cell OVP", severity: "critical" as const },
  { key: "alarm_cell_uvp", label: "Cell UVP", severity: "critical" as const },
  { key: "alarm_pack_uvp", label: "Pack UVP", severity: "critical" as const },
  { key: "alarm_discharge_ocp", label: "Discharge OCP", severity: "critical" as const },
  { key: "alarm_charge_ocp", label: "Charge OCP", severity: "critical" as const },
  { key: "alarm_scp", label: "Short Circuit", severity: "critical" as const },
  { key: "alarm_mos_otp", label: "MOS Over Temp", severity: "warning" as const },
  { key: "alarm_env_otp", label: "Env Over Temp", severity: "warning" as const },
  { key: "alarm_env_utp", label: "Env Under Temp", severity: "warning" as const },
  { key: "alarm_soc_low", label: "Low SOC", severity: "warning" as const },
  { key: "alarm_cell_fault", label: "Cell Fault", severity: "critical" as const },
  { key: "alarm_ntc_fault", label: "NTC Fault", severity: "warning" as const },
];

// ============================================================================
// Default Configuration Values
// ============================================================================

/**
 * Default cell configuration
 */
export const DEFAULT_CELL_CONFIG: CellConfig = {
  count: 16,
  columns: 2,
  layout: "bank",
  orientation: "horizontal",
};

/**
 * Default voltage thresholds for LiFePO4 cells
 */
export const DEFAULT_THRESHOLDS: Thresholds = {
  cell_min: 2.8,
  cell_low: 3.0,
  cell_high: 3.45,
  cell_max: 3.65,
  delta_warning: 20, // mV
  delta_critical: 50, // mV
};

/**
 * Default temperature thresholds
 */
export const DEFAULT_TEMPERATURE_CONFIG: TemperatureConfig = {
  warning: 40,
  critical: 50,
};

/**
 * Default display options
 */
export const DEFAULT_DISPLAY_CONFIG: DisplayConfig = {
  delta_unit: "mV",
  show_power: true,
  show_temperatures: true,
  show_cycle_count: true,
  show_capacity: true,
  compact_mode: false,
};

// ============================================================================
// CSS Custom Properties
// ============================================================================

/**
 * Custom CSS properties for BMS card theming
 */
export const CSS_VARIABLES = {
  // Status colors
  success: "--bms-success",
  successContainer: "--bms-success-container",
  warning: "--bms-warning",
  warningContainer: "--bms-warning-container",
  error: "--bms-error",
  errorContainer: "--bms-error-container",
  info: "--bms-info",
  infoContainer: "--bms-info-container",

  // Cell voltage colors
  cellLow: "--bms-cell-low",
  cellNominal: "--bms-cell-nominal",
  cellHigh: "--bms-cell-high",
  cellCritical: "--bms-cell-critical",

  // Balancing indicator
  balancing: "--bms-balancing",
  balancingPulse: "--bms-balancing-pulse",
} as const;

/**
 * Default color values
 */
export const DEFAULT_COLORS = {
  success: "#4CAF50",
  successContainer: "#C8E6C9",
  warning: "#FF9800",
  warningContainer: "#FFE0B2",
  error: "#F44336",
  errorContainer: "#FFCDD2",
  info: "#2196F3",
  infoContainer: "#BBDEFB",
  cellLow: "#F44336",
  cellNominal: "#4CAF50",
  cellHigh: "#FF9800",
  cellCritical: "#9C27B0",
  balancing: "#00BCD4",
  balancingPulse: "#00BCD480",
} as const;

// ============================================================================
// Animation Constants
// ============================================================================

/**
 * Animation durations in milliseconds
 */
export const ANIMATION = {
  /** Standard transition duration */
  standard: 300,
  /** Pulse animation duration */
  pulse: 1500,
  /** Fast transition for quick updates */
  fast: 150,
} as const;

// ============================================================================
// Card Registration
// ============================================================================

/**
 * Card information for Home Assistant registration
 */
export const CARD_INFO = {
  type: "ha-bms-card",
  name: "HA BMS Card",
  description: "A custom card for displaying Battery Management System data",
  version: "1.0.0",
} as const;

// ============================================================================
// Supported Cell Counts
// ============================================================================

/**
 * Supported cell counts for validation
 */
export const SUPPORTED_CELL_COUNTS = [4, 8, 12, 16, 20, 24, 28, 32] as const;

/**
 * Supported column counts
 */
export const SUPPORTED_COLUMN_COUNTS = [1, 2, 3, 4] as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get default temperature sensor ranges based on cell count
 * @param cellCount Total number of cells
 * @param sensorCount Number of temperature sensors (default 4)
 * @returns Array of range strings like ["1_4", "5_8", "9_12", "13_16"]
 */
export function getDefaultTempRanges(cellCount: number, sensorCount = 4): string[] {
  const cellsPerSensor = Math.ceil(cellCount / sensorCount);
  const ranges: string[] = [];

  for (let i = 0; i < sensorCount; i++) {
    const start = i * cellsPerSensor + 1;
    const end = Math.min((i + 1) * cellsPerSensor, cellCount);
    ranges.push(`${start}_${end}`);
  }

  return ranges;
}

/**
 * Create a complete default configuration
 * @param overrides Partial config to merge with defaults
 * @returns Complete BMSCardConfig
 */
export function createDefaultConfig(
  overrides?: Partial<BMSCardConfig>
): Omit<BMSCardConfig, "type"> & { type?: string } {
  return {
    type: CARD_INFO.type,
    title: overrides?.title ?? "Battery Pack",
    cells: {
      ...DEFAULT_CELL_CONFIG,
      ...overrides?.cells,
    },
    thresholds: {
      ...DEFAULT_THRESHOLDS,
      ...overrides?.thresholds,
    },
    temperature: {
      ...DEFAULT_TEMPERATURE_CONFIG,
      ...overrides?.temperature,
    },
    display: {
      ...DEFAULT_DISPLAY_CONFIG,
      ...overrides?.display,
    },
    entity_pattern: overrides?.entity_pattern,
    entities: overrides?.entities ?? {},
  };
}
