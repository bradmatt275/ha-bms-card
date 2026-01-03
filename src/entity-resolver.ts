/**
 * Generic BMS Card - Entity Resolver
 * Handles template pattern resolution and entity ID management
 */

import { HomeAssistant } from "custom-card-helpers";
import { BMSCardConfig, AlarmConfig } from "./types";
import { DEFAULT_TEMPLATES, getDefaultTempRanges } from "./const";

/**
 * Resolves entity IDs from configuration, supporting both
 * explicit entity mappings and template patterns with {prefix}
 */
export class EntityResolver {
  private _config: BMSCardConfig;
  private _prefix: string;
  private _resolvedEntities: Map<string, string> = new Map();
  private _allEntityIds: string[] = [];
  private _alarmEntities: AlarmConfig[] = [];

  /**
   * Standard entity keys that can be resolved from templates
   */
  private static readonly STANDARD_KEYS = [
    "soc",
    "voltage",
    "current",
    "power",
    "capacity_remaining",
    "capacity_full",
    "cycle_count",
    "delta_voltage",
    "average_cell_voltage",
    "min_cell_voltage",
    "max_cell_voltage",
    "temp_mos",
    "temp_env",
    "charging",
    "discharging",
    "balancing_active",
    "heater",
  ];

  constructor(config: BMSCardConfig) {
    this._config = config;
    this._prefix = config.entity_pattern?.prefix ?? "";
    this._resolveAllEntities();
  }

  /**
   * Resolve all entity IDs from configuration
   */
  private _resolveAllEntities(): void {
    this._resolveStandardEntities();
    this._resolveCellVoltageEntities();
    this._resolveCellBalancingEntities();
    this._resolveTempCellEntities();
    this._resolveAlarmEntities();
  }

  /**
   * Resolve standard single-value entities
   */
  private _resolveStandardEntities(): void {
    for (const key of EntityResolver.STANDARD_KEYS) {
      const entity = this._resolveEntity(key);
      if (entity) {
        this._resolvedEntities.set(key, entity);
        this._allEntityIds.push(entity);
      }
    }
  }

  /**
   * Resolve a single entity from explicit config or template
   */
  private _resolveEntity(key: string): string | undefined {
    // Check explicit config first (always takes priority)
    const explicit = this._config.entities?.[key as keyof typeof this._config.entities];
    if (typeof explicit === "string") {
      return explicit;
    }

    // Fall back to template pattern
    const template = DEFAULT_TEMPLATES[key];
    if (template && this._prefix) {
      return this._applyTemplate(template);
    }

    return undefined;
  }

  /**
   * Apply prefix to a template string
   */
  private _applyTemplate(template: string): string {
    return template.replace(/\{prefix\}/g, this._prefix);
  }

  /**
   * Resolve cell voltage entities
   */
  private _resolveCellVoltageEntities(): void {
    const cellCount = this._config.cells.count;
    const cellVoltages = this._config.entities?.cell_voltages;

    for (let i = 1; i <= cellCount; i++) {
      let entity: string | undefined;

      // Check explicit array
      if (Array.isArray(cellVoltages) && cellVoltages[i - 1]) {
        entity = cellVoltages[i - 1];
      }
      // Check pattern in config
      else if (cellVoltages && typeof cellVoltages === "object" && "pattern" in cellVoltages) {
        entity = this._applyCellTemplate(cellVoltages.pattern, i);
      }
      // Use default pattern
      else if (this._prefix) {
        entity = this._applyCellTemplate(DEFAULT_TEMPLATES.cell_voltage_pattern, i);
      }

      if (entity) {
        this._resolvedEntities.set(`cell_voltage_${i}`, entity);
        this._allEntityIds.push(entity);
      }
    }
  }

  /**
   * Resolve cell balancing entities
   */
  private _resolveCellBalancingEntities(): void {
    const cellCount = this._config.cells.count;
    const cellBalancing = this._config.entities?.cell_balancing;

    // Only resolve if pattern is configured
    if (!cellBalancing?.pattern && !this._prefix) {
      return;
    }

    for (let i = 1; i <= cellCount; i++) {
      let entity: string | undefined;

      if (cellBalancing?.pattern) {
        entity = this._applyCellTemplate(cellBalancing.pattern, i);
      } else if (this._prefix && DEFAULT_TEMPLATES.cell_balancing_pattern) {
        entity = this._applyCellTemplate(DEFAULT_TEMPLATES.cell_balancing_pattern, i);
      }

      if (entity) {
        this._resolvedEntities.set(`cell_balancing_${i}`, entity);
        this._allEntityIds.push(entity);
      }
    }
  }

  /**
   * Apply cell number to a template
   */
  private _applyCellTemplate(pattern: string, cellNumber: number): string {
    return pattern
      .replace(/\{prefix\}/g, this._prefix)
      .replace(/\{n\}/g, String(cellNumber));
  }

  /**
   * Resolve temperature cell entities
   */
  private _resolveTempCellEntities(): void {
    const tempCells = this._config.entities?.temp_cells;

    // Use explicit array if provided
    if (Array.isArray(tempCells)) {
      tempCells.forEach((entity, index) => {
        this._resolvedEntities.set(`temp_cell_${index}`, entity);
        this._allEntityIds.push(entity);
      });
      return;
    }

    // Generate from template if prefix is available
    if (this._prefix) {
      const ranges = getDefaultTempRanges(this._config.cells.count);
      ranges.forEach((range, index) => {
        const entity = DEFAULT_TEMPLATES.temp_cell_pattern
          .replace(/\{prefix\}/g, this._prefix)
          .replace(/\{range\}/g, range);
        this._resolvedEntities.set(`temp_cell_${index}`, entity);
        this._allEntityIds.push(entity);
      });
    }
  }

  /**
   * Resolve alarm entities
   */
  private _resolveAlarmEntities(): void {
    const alarms = this._config.entities?.alarms;

    if (Array.isArray(alarms)) {
      this._alarmEntities = alarms;
      alarms.forEach((alarm) => {
        this._allEntityIds.push(alarm.entity);
      });
    }
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Get a resolved entity ID by key
   */
  getEntity(key: string): string | undefined {
    return this._resolvedEntities.get(key);
  }

  /**
   * Get cell voltage entity for a specific cell
   */
  getCellVoltageEntity(cellNumber: number): string | undefined {
    return this._resolvedEntities.get(`cell_voltage_${cellNumber}`);
  }

  /**
   * Get cell balancing entity for a specific cell
   */
  getCellBalancingEntity(cellNumber: number): string | undefined {
    return this._resolvedEntities.get(`cell_balancing_${cellNumber}`);
  }

  /**
   * Get all temperature cell entities
   */
  getTempCellEntities(): string[] {
    const entities: string[] = [];
    let index = 0;
    while (this._resolvedEntities.has(`temp_cell_${index}`)) {
      entities.push(this._resolvedEntities.get(`temp_cell_${index}`)!);
      index++;
    }
    return entities;
  }

  /**
   * Get all alarm configurations
   */
  getAlarms(): AlarmConfig[] {
    return this._alarmEntities;
  }

  /**
   * Get all resolved entity IDs
   */
  getAllEntityIds(): string[] {
    return [...this._allEntityIds];
  }

  /**
   * Check if any relevant entity state has changed
   * Used for optimizing shouldUpdate()
   */
  hasStateChanged(oldHass: HomeAssistant, newHass: HomeAssistant): boolean {
    return this._allEntityIds.some((entityId) => {
      const oldState = oldHass.states[entityId];
      const newState = newHass.states[entityId];
      // Compare state objects by reference (HA creates new objects on change)
      return oldState !== newState;
    });
  }

  /**
   * Check if an entity exists in Home Assistant
   */
  entityExists(hass: HomeAssistant, entityId: string | undefined): boolean {
    return entityId !== undefined && entityId in hass.states;
  }

  /**
   * Get numeric state value from an entity
   * @returns number or null if entity doesn't exist or value is invalid
   */
  getNumericState(hass: HomeAssistant, entityId: string | undefined): number | null {
    if (!entityId || !hass.states[entityId]) {
      return null;
    }
    const state = hass.states[entityId].state;
    if (state === "unknown" || state === "unavailable") {
      return null;
    }
    const value = parseFloat(state);
    return isNaN(value) ? null : value;
  }

  /**
   * Get binary state value from an entity
   * @returns true if state is "on", false otherwise
   */
  getBinaryState(hass: HomeAssistant, entityId: string | undefined): boolean {
    if (!entityId || !hass.states[entityId]) {
      return false;
    }
    return hass.states[entityId].state === "on";
  }

  /**
   * Debug: Get all resolved entities as a map
   */
  getResolvedEntitiesDebug(): Record<string, string> {
    const result: Record<string, string> = {};
    this._resolvedEntities.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}
