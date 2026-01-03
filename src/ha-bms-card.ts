/**
 * Generic BMS Card for Home Assistant
 * Main card class that composes all components
 */

import { LitElement, html, PropertyValues, TemplateResult, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard, LovelaceCardConfig } from "custom-card-helpers";

import { BMSCardConfig, BMSState, CellData, ActiveAlarm } from "./types";
import { EntityResolver } from "./entity-resolver";
import { styles } from "./styles";
import {
  DEFAULT_CELL_CONFIG,
  DEFAULT_THRESHOLDS,
  DEFAULT_TEMPERATURE_CONFIG,
  DEFAULT_DISPLAY_CONFIG,
  CARD_INFO,
} from "./const";
// Format utilities imported as needed
import { evaluateDeltaState } from "./utils/threshold";

// Import components
import "./components/soc-ring";
import "./components/status-indicator";
import "./components/stat-card";
import "./components/cell-grid";
import "./components/alert-badge";
import "./components/temp-bar";

// Import editor for visual configuration
import "./editor";

// Card registration info for HA
const cardInfo = {
  type: CARD_INFO.type,
  name: CARD_INFO.name,
  description: CARD_INFO.description,
};

// Register card with Home Assistant
// @ts-ignore
window.customCards = window.customCards || [];
// @ts-ignore
window.customCards.push(cardInfo);

@customElement("ha-bms-card")
export class HABMSCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: BMSCardConfig;
  @state() private _state!: BMSState;

  private _entityResolver!: EntityResolver;

  static styles = styles;

  /**
   * Set card configuration
   */
  public setConfig(config: LovelaceCardConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }

    // Merge with defaults
    this._config = {
      ...config,
      title: config.title || "Battery Pack",
      cells: {
        ...DEFAULT_CELL_CONFIG,
        ...config.cells,
      },
      thresholds: {
        ...DEFAULT_THRESHOLDS,
        ...config.thresholds,
      },
      temperature: {
        ...DEFAULT_TEMPERATURE_CONFIG,
        ...config.temperature,
      },
      display: {
        ...DEFAULT_DISPLAY_CONFIG,
        ...config.display,
      },
      entity_pattern: config.entity_pattern,
      entities: config.entities || {},
    } as BMSCardConfig;

    // Initialize entity resolver
    this._entityResolver = new EntityResolver(this._config);

    // Initialize empty state
    this._initializeState();
  }

  /**
   * Initialize empty BMS state
   */
  private _initializeState(): void {
    this._state = {
      soc: null,
      voltage: null,
      current: null,
      power: null,
      capacityRemaining: null,
      capacityFull: null,
      cycleCount: null,
      tempMos: null,
      tempEnv: null,
      tempCells: [],
      cells: [],
      minVoltage: null,
      maxVoltage: null,
      deltaVoltage: null,
      averageCellVoltage: null,
      minCellNumber: null,
      maxCellNumber: null,
      isCharging: false,
      isDischarging: false,
      isBalancing: false,
      heaterOn: false,
      activeAlarms: [],
    };
  }

  /**
   * Optimize re-renders by only updating when relevant entities change
   */
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has("_config")) return true;

    const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
    if (!oldHass) return true;

    // Only update if relevant entities changed
    return this._entityResolver.hasStateChanged(oldHass, this.hass);
  }

  /**
   * Update state when hass or config changes
   */
  protected updated(changedProps: PropertyValues): void {
    if (changedProps.has("hass") || changedProps.has("_config")) {
      this._updateState();
    }
  }

  /**
   * Update BMS state from Home Assistant entity states
   */
  private _updateState(): void {
    if (!this.hass || !this._entityResolver) return;

    const resolver = this._entityResolver;

    // Update cell data
    const cells: CellData[] = [];
    for (let i = 1; i <= this._config.cells.count; i++) {
      const voltageEntity = resolver.getCellVoltageEntity(i);
      const balancingEntity = resolver.getCellBalancingEntity(i);

      cells.push({
        number: i,
        voltage: resolver.getNumericState(this.hass, voltageEntity),
        balancing: resolver.getBinaryState(this.hass, balancingEntity),
      });
    }

    // Calculate derived values from cells
    const voltages = cells
      .map((c) => c.voltage)
      .filter((v): v is number => v !== null);

    let minVoltage: number | null = null;
    let maxVoltage: number | null = null;
    let deltaVoltage: number | null = null;
    let averageCellVoltage: number | null = null;
    let minCellNumber: number | null = null;
    let maxCellNumber: number | null = null;

    if (voltages.length > 0) {
      minVoltage = Math.min(...voltages);
      maxVoltage = Math.max(...voltages);
      
      // Delta voltage - use sensor if available, otherwise calculate
      const deltaEntity = resolver.getEntity("delta_voltage");
      deltaVoltage = resolver.getNumericState(this.hass, deltaEntity);
      if (deltaVoltage === null) {
        deltaVoltage = maxVoltage - minVoltage;
      }

      // Average cell voltage - use sensor if available, otherwise calculate
      const avgEntity = resolver.getEntity("average_cell_voltage");
      averageCellVoltage = resolver.getNumericState(this.hass, avgEntity);
      if (averageCellVoltage === null) {
        averageCellVoltage = voltages.reduce((a, b) => a + b, 0) / voltages.length;
      }

      // Find min/max cell numbers
      minCellNumber = cells.find((c) => c.voltage === minVoltage)?.number ?? null;
      maxCellNumber = cells.find((c) => c.voltage === maxVoltage)?.number ?? null;
    }

    // Get power - use sensor if available, otherwise calculate
    const powerEntity = resolver.getEntity("power");
    let power = resolver.getNumericState(this.hass, powerEntity);
    const voltage = resolver.getNumericState(this.hass, resolver.getEntity("voltage"));
    const current = resolver.getNumericState(this.hass, resolver.getEntity("current"));
    
    if (power === null && voltage !== null && current !== null) {
      power = voltage * current;
    }

    // Get temperature cell values
    const tempCellEntities = resolver.getTempCellEntities();
    const tempCells = tempCellEntities.map((e) =>
      resolver.getNumericState(this.hass, e)
    );

    // Get active alarms
    const activeAlarms = this._getActiveAlarms();

    // Update state
    this._state = {
      soc: resolver.getNumericState(this.hass, resolver.getEntity("soc")),
      voltage,
      current,
      power,
      capacityRemaining: resolver.getNumericState(
        this.hass,
        resolver.getEntity("capacity_remaining")
      ),
      capacityFull: resolver.getNumericState(
        this.hass,
        resolver.getEntity("capacity_full")
      ),
      cycleCount: resolver.getNumericState(
        this.hass,
        resolver.getEntity("cycle_count")
      ),
      tempMos: resolver.getNumericState(this.hass, resolver.getEntity("temp_mos")),
      tempEnv: resolver.getNumericState(this.hass, resolver.getEntity("temp_env")),
      tempCells,
      cells,
      minVoltage,
      maxVoltage,
      deltaVoltage,
      averageCellVoltage,
      minCellNumber,
      maxCellNumber,
      isCharging: resolver.getBinaryState(this.hass, resolver.getEntity("charging")),
      isDischarging: resolver.getBinaryState(
        this.hass,
        resolver.getEntity("discharging")
      ),
      isBalancing: resolver.getBinaryState(
        this.hass,
        resolver.getEntity("balancing_active")
      ),
      heaterOn: resolver.getBinaryState(this.hass, resolver.getEntity("heater")),
      activeAlarms,
    };
  }

  /**
   * Get list of active alarms
   */
  private _getActiveAlarms(): ActiveAlarm[] {
    const alarms = this._entityResolver.getAlarms();
    return alarms
      .filter((alarm) =>
        this._entityResolver.getBinaryState(this.hass, alarm.entity)
      )
      .map((alarm) => ({
        label: alarm.label,
        severity: alarm.severity,
      }));
  }

  /**
   * Render the card
   */
  protected render(): TemplateResult {
    if (!this._config || !this._state) {
      return html`<ha-card>Loading...</ha-card>`;
    }

    const { _config: config, _state: state } = this;
    const hasCriticalAlarm = state.activeAlarms.some(
      (a) => a.severity === "critical"
    );

    // Set CSS variable for column-based width
    const columnStyle = `--bms-columns: ${config.cells.columns};`;

    return html`
      <ha-card 
        class="${config.display.compact_mode ? "compact" : ""}"
        style="${columnStyle}"
      >
        <!-- Header -->
        <div class="card-header">
          <span class="title">${config.title}</span>
          <div class="alert-indicators">
            ${state.activeAlarms.map(
              (alarm) => html`
                <bms-alert-badge
                  .label=${alarm.label}
                  .severity=${alarm.severity}
                ></bms-alert-badge>
              `
            )}
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
            ${this._renderPrimaryStats()}
            ${this._renderSecondaryStats()}
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
          ${this._renderTemperatureSection()}
        </div>
      </ha-card>
    `;
  }

  /**
   * Render primary stats (voltage, current, power, capacity)
   */
  private _renderPrimaryStats(): TemplateResult {
    const { _config: config, _state: state } = this;

    return html`
      <bms-stat-card class="stats-primary">
        <div class="stat-row">
          <bms-stat
            label="Voltage"
            .value=${state.voltage}
            unit="V"
            size="large"
            .decimals=${2}
          ></bms-stat>
          <bms-stat
            label="Current"
            .value=${state.current}
            unit="A"
            size="large"
            .decimals=${1}
          ></bms-stat>
        </div>
        ${config.display.show_power
          ? html`
              <bms-stat
                label="Power"
                .value=${state.power}
                unit="W"
                .decimals=${0}
              ></bms-stat>
            `
          : nothing}
        ${config.display.show_capacity
          ? html`
              <bms-stat
                label="Capacity"
                .value=${state.capacityRemaining}
                unit="Ah"
                .decimals=${2}
              ></bms-stat>
            `
          : nothing}
      </bms-stat-card>
    `;
  }

  /**
   * Render secondary stats (temps, delta, cycles)
   */
  private _renderSecondaryStats(): TemplateResult {
    const { _config: config, _state: state } = this;
    const deltaState = evaluateDeltaState(state.deltaVoltage, config.thresholds);
    const deltaValue = config.display.delta_unit === "mV"
      ? state.deltaVoltage !== null ? state.deltaVoltage * 1000 : null
      : state.deltaVoltage;

    const tempWarning = state.tempMos !== null && state.tempMos >= config.temperature.warning;
    const tempCritical = state.tempMos !== null && state.tempMos >= config.temperature.critical;

    return html`
      <bms-stat-card class="stats-secondary">
        <bms-stat
          label="MOS Temp"
          .value=${state.tempMos}
          unit="°C"
          .decimals=${1}
          .warning=${tempWarning && !tempCritical}
          .critical=${tempCritical}
        ></bms-stat>
        <bms-stat
          label="Delta"
          .value=${deltaValue}
          unit=${config.display.delta_unit}
          .decimals=${config.display.delta_unit === "mV" ? 0 : 3}
          .warning=${deltaState === "warning"}
          .critical=${deltaState === "critical"}
        ></bms-stat>
        ${config.display.show_cycle_count
          ? html`
              <bms-stat
                label="Cycles"
                .value=${state.cycleCount}
                .decimals=${0}
              ></bms-stat>
            `
          : nothing}
      </bms-stat-card>
    `;
  }

  /**
   * Render temperature sensors section
   */
  private _renderTemperatureSection(): TemplateResult | typeof nothing {
    const { _config: config, _state: state } = this;

    if (!config.display.show_temperatures || state.tempCells.length === 0) {
      return nothing;
    }

    return html`
      <div class="temp-section">
        <div class="temp-grid">
          ${state.tempCells.map(
            (temp, i) => html`
              <bms-temp-bar
                label="T${this._getTempRange(i)}"
                .value=${temp}
                .warning=${config.temperature.warning}
                .critical=${config.temperature.critical}
              ></bms-temp-bar>
            `
          )}
        </div>
      </div>
    `;
  }

  /**
   * Get temperature range label for index
   */
  private _getTempRange(index: number): string {
    const cellsPerSensor = Math.ceil(this._config.cells.count / 4);
    const start = index * cellsPerSensor + 1;
    const end = Math.min((index + 1) * cellsPerSensor, this._config.cells.count);
    return `${start}-${end}`;
  }

  /**
   * Get card size for dashboard layout
   */
  public getCardSize(): number {
    return this._config?.display?.compact_mode ? 4 : 6;
  }

  /**
   * Get config element for visual editor
   */
  static getConfigElement(): HTMLElement {
    return document.createElement("ha-bms-card-editor");
  }

  /**
   * Get stub config for new card creation
   */
  static getStubConfig(): Record<string, unknown> {
    return {
      title: "Battery Pack",
      cells: {
        count: 16,
        columns: 2,
        layout: "bank",
      },
      entity_pattern: {
        prefix: "pack_1",
      },
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-bms-card": HABMSCard;
  }
}
