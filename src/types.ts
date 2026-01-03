/**
 * Generic BMS Card - Type Definitions
 * TypeScript interfaces for configuration and state management
 */

import { LovelaceCardConfig } from "custom-card-helpers";

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Main card configuration interface
 */
export interface BMSCardConfig extends LovelaceCardConfig {
  title: string;
  cells: CellConfig;
  thresholds: Thresholds;
  temperature: TemperatureConfig;
  display: DisplayConfig;
  entity_pattern?: EntityPattern;
  entities: EntityConfig;
}

/**
 * Cell grid configuration
 */
export interface CellConfig {
  /** Number of cells (4, 8, 16, 24, or 32) */
  count: number;
  /** Number of columns for display (1-4) */
  columns: number;
  /** Layout mode: 'incremental' flows L-R, 'bank' splits columns */
  layout: "incremental" | "bank";
  /** Grid orientation */
  orientation: "horizontal" | "vertical";
}

/**
 * Voltage thresholds for cell coloring
 */
export interface Thresholds {
  /** Below this = critical (red) */
  cell_min: number;
  /** Below this = warning (orange) */
  cell_low: number;
  /** Above this = warning (orange) */
  cell_high: number;
  /** Above this = critical (purple) */
  cell_max: number;
  /** Delta mV warning threshold */
  delta_warning: number;
  /** Delta mV critical threshold */
  delta_critical: number;
}

/**
 * Temperature display thresholds
 */
export interface TemperatureConfig {
  /** °C - show warning color */
  warning: number;
  /** °C - show critical color */
  critical: number;
}

/**
 * Display options
 */
export interface DisplayConfig {
  /** Unit for delta voltage display */
  delta_unit: "mV" | "V";
  /** Show power stat */
  show_power: boolean;
  /** Show temperature sensors section */
  show_temperatures: boolean;
  /** Show cycle count stat */
  show_cycle_count: boolean;
  /** Show capacity stat */
  show_capacity: boolean;
  /** Reduce padding for smaller cards */
  compact_mode: boolean;
}

/**
 * Entity pattern for template-based entity resolution
 */
export interface EntityPattern {
  /** Prefix to replace {prefix} in templates */
  prefix?: string;
}

/**
 * Explicit entity configuration
 */
export interface EntityConfig {
  // Core sensors
  /** State of charge sensor */
  soc?: string;
  /** Pack voltage sensor */
  voltage?: string;
  /** Current sensor (positive = charging, negative = discharging) */
  current?: string;
  /** Power sensor (optional - calculated from voltage × current if missing) */
  power?: string;
  /** Remaining capacity in Ah */
  capacity_remaining?: string;
  /** Full capacity in Ah */
  capacity_full?: string;
  /** Charge cycle count */
  cycle_count?: string;

  // Derived values (optional - calculated from cell voltages if missing)
  /** Delta voltage between cells (calculated if not provided) */
  delta_voltage?: string;
  /** Average cell voltage (calculated if not provided) */
  average_cell_voltage?: string;
  /** Minimum cell voltage (calculated if not provided) */
  min_cell_voltage?: string;
  /** Maximum cell voltage (calculated if not provided) */
  max_cell_voltage?: string;

  // Temperature sensors
  /** MOS/FET temperature sensor */
  temp_mos?: string;
  /** Environment temperature sensor */
  temp_env?: string;
  /** Array of cell temperature sensors */
  temp_cells?: string[];

  // Cell data
  /** Cell voltage entities - array or pattern object */
  cell_voltages?: string[] | { pattern: string };
  /** Cell balancing status pattern */
  cell_balancing?: { pattern: string };

  // System status
  /** Charge MOS enabled */
  charging?: string;
  /** Discharge MOS enabled */
  discharging?: string;
  /** Overall balancing state */
  balancing_active?: string;
  /** Heater enabled */
  heater?: string;

  // Alarms
  /** Array of alarm configurations */
  alarms?: AlarmConfig[];
}

/**
 * Individual alarm configuration
 */
export interface AlarmConfig {
  /** Binary sensor entity ID */
  entity: string;
  /** Display label for the alarm */
  label: string;
  /** Severity level */
  severity: "warning" | "critical";
}

// ============================================================================
// State Types
// ============================================================================

/**
 * Individual cell data
 */
export interface CellData {
  /** Cell number (1-based) */
  number: number;
  /** Cell voltage in volts (null if unavailable) */
  voltage: number | null;
  /** Whether cell is actively balancing */
  balancing: boolean;
}

/**
 * Complete BMS state representation
 */
export interface BMSState {
  // Core values
  /** State of charge percentage */
  soc: number | null;
  /** Pack voltage in volts */
  voltage: number | null;
  /** Current in amps (positive = charging) */
  current: number | null;
  /** Power in watts */
  power: number | null;
  /** Remaining capacity in Ah */
  capacityRemaining: number | null;
  /** Full capacity in Ah */
  capacityFull: number | null;
  /** Charge cycle count */
  cycleCount: number | null;

  // Temperature values
  /** MOS temperature in °C */
  tempMos: number | null;
  /** Environment temperature in °C */
  tempEnv: number | null;
  /** Cell temperature sensor values */
  tempCells: (number | null)[];

  // Cell data
  /** Array of cell data */
  cells: CellData[];

  // Derived values (from sensors or calculated)
  /** Minimum cell voltage */
  minVoltage: number | null;
  /** Maximum cell voltage */
  maxVoltage: number | null;
  /** Delta voltage between cells */
  deltaVoltage: number | null;
  /** Average cell voltage */
  averageCellVoltage: number | null;
  /** Cell number with lowest voltage */
  minCellNumber: number | null;
  /** Cell number with highest voltage */
  maxCellNumber: number | null;

  // System status
  /** Charge MOS enabled */
  isCharging: boolean;
  /** Discharge MOS enabled */
  isDischarging: boolean;
  /** Balancing active */
  isBalancing: boolean;
  /** Heater enabled */
  heaterOn: boolean;

  // Alarms
  /** Currently active alarms */
  activeAlarms: ActiveAlarm[];
}

/**
 * Active alarm with label and severity
 */
export interface ActiveAlarm {
  label: string;
  severity: "warning" | "critical";
}

// ============================================================================
// Component Property Types
// ============================================================================

/**
 * Props for the SOC ring component
 */
export interface SocRingProps {
  soc: number | null;
  remaining: number | null;
  hasAlarm: boolean;
}

/**
 * Props for the status indicator component
 */
export interface StatusIndicatorProps {
  type: "charge" | "discharge";
  active: boolean;
  label: string;
}

/**
 * Props for the stat card component
 */
export interface StatCardProps {
  label: string;
  value: number | string | null;
  unit?: string;
  size?: "normal" | "large";
  warning?: boolean;
  critical?: boolean;
}

/**
 * Props for the cell grid component
 */
export interface CellGridProps {
  cells: CellData[];
  columns: number;
  layout: "incremental" | "bank";
  orientation: "horizontal" | "vertical";
  thresholds: Thresholds;
  minCellNumber: number | null;
  maxCellNumber: number | null;
}

/**
 * Props for the alert badge component
 */
export interface AlertBadgeProps {
  label: string;
  severity: "warning" | "critical";
}

/**
 * Props for the temp bar component
 */
export interface TempBarProps {
  label: string;
  value: number | null;
  warning: number;
  critical: number;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Default entity templates with {prefix} placeholder
 */
export interface DefaultTemplates {
  [key: string]: string;
}

/**
 * Voltage state classification
 */
export type VoltageState =
  | "critical-low"
  | "warning-low"
  | "nominal"
  | "warning-high"
  | "critical-high";

/**
 * Temperature state classification
 */
export type TemperatureState = "normal" | "warning" | "critical";
