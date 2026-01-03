/**
 * Generic BMS Card - Threshold Evaluation Utilities
 */

import { Thresholds, TemperatureConfig, VoltageState, TemperatureState } from "../types";
import { DEFAULT_COLORS } from "../const";

/**
 * Evaluate voltage state based on thresholds
 */
export function evaluateVoltageState(
  voltage: number | null,
  thresholds: Thresholds
): VoltageState {
  if (voltage === null) return "nominal";
  
  if (voltage < thresholds.cell_min) return "critical-low";
  if (voltage < thresholds.cell_low) return "warning-low";
  if (voltage > thresholds.cell_max) return "critical-high";
  if (voltage > thresholds.cell_high) return "warning-high";
  return "nominal";
}

/**
 * Evaluate temperature state based on thresholds
 */
export function evaluateTemperatureState(
  temperature: number | null,
  config: TemperatureConfig
): TemperatureState {
  if (temperature === null) return "normal";
  
  if (temperature >= config.critical) return "critical";
  if (temperature >= config.warning) return "warning";
  return "normal";
}

/**
 * Evaluate delta voltage state based on thresholds
 * @param delta Delta voltage in volts
 * @param thresholds Thresholds config (delta values in mV)
 */
export function evaluateDeltaState(
  delta: number | null,
  thresholds: Thresholds
): "normal" | "warning" | "critical" {
  if (delta === null) return "normal";
  
  const deltaMv = delta * 1000;
  if (deltaMv >= thresholds.delta_critical) return "critical";
  if (deltaMv >= thresholds.delta_warning) return "warning";
  return "normal";
}

/**
 * Get CSS color for voltage state
 */
export function getVoltageColor(state: VoltageState): string {
  switch (state) {
    case "critical-low":
      return `var(--bms-cell-low, ${DEFAULT_COLORS.cellLow})`;
    case "warning-low":
      return `var(--bms-warning, ${DEFAULT_COLORS.warning})`;
    case "warning-high":
      return `var(--bms-cell-high, ${DEFAULT_COLORS.cellHigh})`;
    case "critical-high":
      return `var(--bms-cell-critical, ${DEFAULT_COLORS.cellCritical})`;
    default:
      return `var(--bms-cell-nominal, ${DEFAULT_COLORS.cellNominal})`;
  }
}

/**
 * Get CSS color for temperature state
 */
export function getTemperatureColor(state: TemperatureState): string {
  switch (state) {
    case "critical":
      return `var(--bms-error, ${DEFAULT_COLORS.error})`;
    case "warning":
      return `var(--bms-warning, ${DEFAULT_COLORS.warning})`;
    default:
      return `var(--bms-success, ${DEFAULT_COLORS.success})`;
  }
}

/**
 * Get CSS color for delta state
 */
export function getDeltaColor(state: "normal" | "warning" | "critical"): string {
  switch (state) {
    case "critical":
      return `var(--bms-error, ${DEFAULT_COLORS.error})`;
    case "warning":
      return `var(--bms-warning, ${DEFAULT_COLORS.warning})`;
    default:
      return "var(--primary-text-color)";
  }
}

/**
 * Get CSS class for voltage state
 */
export function getVoltageStateClass(state: VoltageState): string {
  return state;
}

/**
 * Get SOC color based on percentage
 */
export function getSocColor(
  soc: number | null,
  hasAlarm: boolean
): string {
  if (hasAlarm) {
    return `var(--bms-error, ${DEFAULT_COLORS.error})`;
  }
  if (soc === null) {
    return "var(--divider-color)";
  }
  if (soc <= 10) {
    return `var(--bms-error, ${DEFAULT_COLORS.error})`;
  }
  if (soc <= 20) {
    return `var(--bms-warning, ${DEFAULT_COLORS.warning})`;
  }
  return `var(--bms-success, ${DEFAULT_COLORS.success})`;
}

/**
 * Get SOC state string
 */
export function getSocState(
  soc: number | null,
  hasAlarm: boolean
): "alarm" | "critical" | "warning" | "healthy" {
  if (hasAlarm) return "alarm";
  if (soc === null) return "healthy";
  if (soc <= 10) return "critical";
  if (soc <= 20) return "warning";
  return "healthy";
}

/**
 * Calculate cell bar width percentage based on voltage and thresholds
 */
export function calculateBarWidth(
  voltage: number | null,
  thresholds: Thresholds
): number {
  if (voltage === null) return 0;
  
  const range = thresholds.cell_max - thresholds.cell_min;
  if (range === 0) return 0;
  
  const normalized = (voltage - thresholds.cell_min) / range;
  return Math.max(0, Math.min(100, normalized * 100));
}

/**
 * Check if a cell is the minimum voltage cell
 */
export function isMinCell(
  cellNumber: number,
  minCellNumber: number | null
): boolean {
  return minCellNumber !== null && cellNumber === minCellNumber;
}

/**
 * Check if a cell is the maximum voltage cell
 */
export function isMaxCell(
  cellNumber: number,
  maxCellNumber: number | null
): boolean {
  return maxCellNumber !== null && cellNumber === maxCellNumber;
}
