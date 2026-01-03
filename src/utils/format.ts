/**
 * Generic BMS Card - Number Formatting Utilities
 */

/**
 * Format a number with specified decimal places
 * Returns "---" if value is null/undefined
 */
export function formatNumber(
  value: number | null | undefined,
  decimals = 2
): string {
  if (value === null || value === undefined) {
    return "---";
  }
  return value.toFixed(decimals);
}

/**
 * Format voltage value (3 decimal places)
 */
export function formatVoltage(value: number | null): string {
  return formatNumber(value, 3);
}

/**
 * Format current value (1 decimal place, with sign)
 */
export function formatCurrent(value: number | null): string {
  if (value === null) return "---";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}`;
}

/**
 * Format power value (0 decimal places)
 */
export function formatPower(value: number | null): string {
  return formatNumber(value, 0);
}

/**
 * Format temperature value (1 decimal place)
 */
export function formatTemperature(value: number | null): string {
  return formatNumber(value, 1);
}

/**
 * Format SOC percentage (1 decimal place)
 */
export function formatSoc(value: number | null): string {
  return formatNumber(value, 1);
}

/**
 * Format capacity in Ah (2 decimal places)
 */
export function formatCapacity(value: number | null): string {
  return formatNumber(value, 2);
}

/**
 * Format delta voltage in mV or V based on config
 * @param value Delta voltage in volts
 * @param unit Target unit ("mV" or "V")
 */
export function formatDelta(
  value: number | null,
  unit: "mV" | "V" = "mV"
): string {
  if (value === null) return "---";
  
  if (unit === "mV") {
    return (value * 1000).toFixed(0);
  }
  return value.toFixed(3);
}

/**
 * Format cell number with leading zero (01-32)
 */
export function formatCellNumber(cellNumber: number): string {
  return String(cellNumber).padStart(2, "0");
}

/**
 * Get human-readable time ago string
 */
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Calculate percentage within a range
 */
export function percentInRange(
  value: number,
  min: number,
  max: number
): number {
  const range = max - min;
  if (range === 0) return 0;
  return clamp(((value - min) / range) * 100, 0, 100);
}
