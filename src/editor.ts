/**
 * Generic BMS Card - Visual Configuration Editor
 * Provides a UI for configuring the card in the Home Assistant dashboard editor
 */

import { LitElement, html, css, TemplateResult, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, fireEvent, LovelaceCardEditor } from "custom-card-helpers";

import { BMSCardConfig } from "./types";
import {
  DEFAULT_CELL_CONFIG,
  DEFAULT_THRESHOLDS,
  DEFAULT_TEMPERATURE_CONFIG,
  DEFAULT_DISPLAY_CONFIG,
  SUPPORTED_CELL_COUNTS,
  SUPPORTED_COLUMN_COUNTS,
} from "./const";

@customElement("ha-bms-card-editor")
export class HABMSCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: BMSCardConfig;
  @state() private _activeTab = "general";

  static styles = css`
    :host {
      display: block;
    }

    .card-config {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .tabs {
      display: flex;
      border-bottom: 1px solid var(--divider-color);
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .tab {
      padding: 8px 16px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: border-color 0.2s, color 0.2s;
      color: var(--secondary-text-color);
      font-size: 14px;
    }

    .tab:hover {
      color: var(--primary-text-color);
    }

    .tab.active {
      border-bottom-color: var(--primary-color);
      color: var(--primary-color);
    }

    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-group label {
      font-size: 12px;
      font-weight: 500;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    @media (max-width: 450px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    ha-textfield,
    ha-select {
      width: 100%;
    }

    ha-switch {
      --mdc-theme-secondary: var(--primary-color);
    }

    .switch-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .switch-label {
      font-size: 14px;
    }

    .section-header {
      font-size: 14px;
      font-weight: 500;
      margin-top: 12px;
      margin-bottom: 8px;
      color: var(--primary-text-color);
      border-bottom: 1px solid var(--divider-color);
      padding-bottom: 4px;
    }

    .help-text {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-top: 4px;
    }

    ha-entity-picker,
    ha-selector {
      display: block;
      width: 100%;
    }

    .cell-grid-overrides {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    @media (max-width: 500px) {
      .cell-grid-overrides {
        grid-template-columns: 1fr;
      }
    }

    .cell-override {
      margin-bottom: 0;
    }

    .cell-override label {
      font-size: 11px;
    }
  `;

  /**
   * Set editor configuration
   */
  public setConfig(config: BMSCardConfig): void {
    this._config = {
      ...config,
      cells: { ...DEFAULT_CELL_CONFIG, ...config.cells },
      thresholds: { ...DEFAULT_THRESHOLDS, ...config.thresholds },
      temperature: { ...DEFAULT_TEMPERATURE_CONFIG, ...config.temperature },
      display: { ...DEFAULT_DISPLAY_CONFIG, ...config.display },
    };
  }

  /**
   * Render the editor
   */
  protected render(): TemplateResult {
    if (!this._config) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div class="tabs">
          <div
            class="tab ${this._activeTab === "general" ? "active" : ""}"
            @click=${() => (this._activeTab = "general")}
          >
            General
          </div>
          <div
            class="tab ${this._activeTab === "cells" ? "active" : ""}"
            @click=${() => (this._activeTab = "cells")}
          >
            Cells
          </div>
          <div
            class="tab ${this._activeTab === "thresholds" ? "active" : ""}"
            @click=${() => (this._activeTab = "thresholds")}
          >
            Thresholds
          </div>
          <div
            class="tab ${this._activeTab === "display" ? "active" : ""}"
            @click=${() => (this._activeTab = "display")}
          >
            Display
          </div>
          <div
            class="tab ${this._activeTab === "entities" ? "active" : ""}"
            @click=${() => (this._activeTab = "entities")}
          >
            Entities
          </div>
        </div>

        <div class="tab-content">
          ${this._activeTab === "general" ? this._renderGeneralTab() : nothing}
          ${this._activeTab === "cells" ? this._renderCellsTab() : nothing}
          ${this._activeTab === "thresholds" ? this._renderThresholdsTab() : nothing}
          ${this._activeTab === "display" ? this._renderDisplayTab() : nothing}
          ${this._activeTab === "entities" ? this._renderEntitiesTab() : nothing}
        </div>
      </div>
    `;
  }

  /**
   * Render general settings tab
   */
  private _renderGeneralTab(): TemplateResult {
    return html`
      <div class="form-group">
        <label>Card Title</label>
        <ha-textfield
          .value=${this._config.title || ""}
          .placeholder=${"Battery Pack"}
          @input=${(e: Event) => this._updateConfig("title", (e.target as HTMLInputElement).value)}
        ></ha-textfield>
      </div>

      <div class="form-group">
        <label>Entity Prefix</label>
        <ha-textfield
          .value=${this._config.entity_pattern?.prefix || ""}
          .placeholder=${"pack_1"}
          @input=${(e: Event) => this._updateEntityPattern("prefix", (e.target as HTMLInputElement).value)}
        ></ha-textfield>
        <span class="help-text">
          Used to auto-generate entity IDs (e.g., sensor.pack_1_battery_soc)
        </span>
      </div>
    `;
  }

  /**
   * Render cells configuration tab
   */
  private _renderCellsTab(): TemplateResult {
    const cellCountOptions = SUPPORTED_CELL_COUNTS.map((count) => ({
      value: String(count),
      label: `${count}s`,
    }));

    const columnOptions = SUPPORTED_COLUMN_COUNTS.map((count) => ({
      value: String(count),
      label: String(count),
    }));

    return html`
      <div class="form-row">
        <div class="form-group">
          <label>Cell Count</label>
          <ha-selector
            .hass=${this.hass}
            .selector=${{ select: { options: cellCountOptions, mode: "dropdown" } }}
            .value=${String(this._config.cells?.count || 16)}
            @value-changed=${(e: CustomEvent) => this._updateCellConfig("count", Number(e.detail.value))}
          ></ha-selector>
        </div>

        <div class="form-group">
          <label>Columns</label>
          <ha-selector
            .hass=${this.hass}
            .selector=${{ select: { options: columnOptions, mode: "dropdown" } }}
            .value=${String(this._config.cells?.columns || 2)}
            @value-changed=${(e: CustomEvent) => this._updateCellConfig("columns", Number(e.detail.value))}
          ></ha-selector>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Layout Mode</label>
          <ha-selector
            .hass=${this.hass}
            .selector=${{
              select: {
                options: [
                  { value: "bank", label: "Bank (split columns)" },
                  { value: "incremental", label: "Incremental (L-R, T-B)" },
                ],
                mode: "dropdown",
              },
            }}
            .value=${this._config.cells?.layout || "bank"}
            @value-changed=${(e: CustomEvent) => this._updateCellConfig("layout", e.detail.value)}
          ></ha-selector>
        </div>

        <div class="form-group">
          <label>Orientation</label>
          <ha-selector
            .hass=${this.hass}
            .selector=${{
              select: {
                options: [
                  { value: "horizontal", label: "Horizontal" },
                  { value: "vertical", label: "Vertical" },
                ],
                mode: "dropdown",
              },
            }}
            .value=${this._config.cells?.orientation || "horizontal"}
            @value-changed=${(e: CustomEvent) => this._updateCellConfig("orientation", e.detail.value)}
          ></ha-selector>
        </div>
      </div>
    `;
  }

  /**
   * Render thresholds configuration tab
   */
  private _renderThresholdsTab(): TemplateResult {
    return html`
      <div class="section-header">Cell Voltage Thresholds (V)</div>
      <div class="form-row">
        <div class="form-group">
          <label>Min (Critical)</label>
          <ha-textfield
            type="number"
            .value=${String(this._config.thresholds?.cell_min || 2.8)}
            step="0.01"
            @input=${(e: Event) => this._updateThreshold("cell_min", parseFloat((e.target as HTMLInputElement).value))}
          ></ha-textfield>
        </div>
        <div class="form-group">
          <label>Low (Warning)</label>
          <ha-textfield
            type="number"
            .value=${String(this._config.thresholds?.cell_low || 3.0)}
            step="0.01"
            @input=${(e: Event) => this._updateThreshold("cell_low", parseFloat((e.target as HTMLInputElement).value))}
          ></ha-textfield>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>High (Warning)</label>
          <ha-textfield
            type="number"
            .value=${String(this._config.thresholds?.cell_high || 3.45)}
            step="0.01"
            @input=${(e: Event) => this._updateThreshold("cell_high", parseFloat((e.target as HTMLInputElement).value))}
          ></ha-textfield>
        </div>
        <div class="form-group">
          <label>Max (Critical)</label>
          <ha-textfield
            type="number"
            .value=${String(this._config.thresholds?.cell_max || 3.65)}
            step="0.01"
            @input=${(e: Event) => this._updateThreshold("cell_max", parseFloat((e.target as HTMLInputElement).value))}
          ></ha-textfield>
        </div>
      </div>

      <div class="section-header">Delta Voltage Thresholds (mV)</div>
      <div class="form-row">
        <div class="form-group">
          <label>Warning</label>
          <ha-textfield
            type="number"
            .value=${String(this._config.thresholds?.delta_warning || 20)}
            step="1"
            @input=${(e: Event) => this._updateThreshold("delta_warning", parseFloat((e.target as HTMLInputElement).value))}
          ></ha-textfield>
        </div>
        <div class="form-group">
          <label>Critical</label>
          <ha-textfield
            type="number"
            .value=${String(this._config.thresholds?.delta_critical || 50)}
            step="1"
            @input=${(e: Event) => this._updateThreshold("delta_critical", parseFloat((e.target as HTMLInputElement).value))}
          ></ha-textfield>
        </div>
      </div>

      <div class="section-header">Temperature Thresholds (°C)</div>
      <div class="form-row">
        <div class="form-group">
          <label>Warning</label>
          <ha-textfield
            type="number"
            .value=${String(this._config.temperature?.warning || 40)}
            step="1"
            @input=${(e: Event) => this._updateTemperature("warning", parseFloat((e.target as HTMLInputElement).value))}
          ></ha-textfield>
        </div>
        <div class="form-group">
          <label>Critical</label>
          <ha-textfield
            type="number"
            .value=${String(this._config.temperature?.critical || 50)}
            step="1"
            @input=${(e: Event) => this._updateTemperature("critical", parseFloat((e.target as HTMLInputElement).value))}
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  /**
   * Render display options tab
   */
  private _renderDisplayTab(): TemplateResult {
    return html`
      <div class="form-group">
        <label>Delta Voltage Unit</label>
        <ha-selector
          .hass=${this.hass}
          .selector=${{
            select: {
              options: [
                { value: "mV", label: "Millivolts (mV)" },
                { value: "V", label: "Volts (V)" },
              ],
              mode: "dropdown",
            },
          }}
          .value=${this._config.display?.delta_unit || "mV"}
          @value-changed=${(e: CustomEvent) => this._updateDisplay("delta_unit", e.detail.value)}
        ></ha-selector>
      </div>

      <div class="switch-row">
        <span class="switch-label">Show Power</span>
        <ha-switch
          .checked=${this._config.display?.show_power ?? true}
          @change=${(e: Event) => this._updateDisplay("show_power", (e.target as HTMLInputElement).checked)}
        ></ha-switch>
      </div>

      <div class="switch-row">
        <span class="switch-label">Show Temperatures</span>
        <ha-switch
          .checked=${this._config.display?.show_temperatures ?? true}
          @change=${(e: Event) => this._updateDisplay("show_temperatures", (e.target as HTMLInputElement).checked)}
        ></ha-switch>
      </div>

      <div class="switch-row">
        <span class="switch-label">Show Cycle Count</span>
        <ha-switch
          .checked=${this._config.display?.show_cycle_count ?? true}
          @change=${(e: Event) => this._updateDisplay("show_cycle_count", (e.target as HTMLInputElement).checked)}
        ></ha-switch>
      </div>

      <div class="switch-row">
        <span class="switch-label">Show Capacity</span>
        <ha-switch
          .checked=${this._config.display?.show_capacity ?? true}
          @change=${(e: Event) => this._updateDisplay("show_capacity", (e.target as HTMLInputElement).checked)}
        ></ha-switch>
      </div>

      <div class="switch-row">
        <span class="switch-label">Compact Mode</span>
        <ha-switch
          .checked=${this._config.display?.compact_mode ?? false}
          @change=${(e: Event) => this._updateDisplay("compact_mode", (e.target as HTMLInputElement).checked)}
        ></ha-switch>
      </div>
    `;
  }

  /**
   * Render entities configuration tab
   */
  private _renderEntitiesTab(): TemplateResult {
    return html`
      <div class="help-text" style="margin-bottom: 12px;">
        Override auto-generated entity IDs. Leave empty to use the entity prefix pattern.
      </div>

      <div class="section-header">Core Sensors</div>
      ${this._renderEntityField("soc", "State of Charge", ["sensor"])}
      ${this._renderEntityField("voltage", "Voltage", ["sensor"])}
      ${this._renderEntityField("current", "Current", ["sensor"])}
      ${this._renderEntityField("power", "Power (optional)", ["sensor"])}

      <div class="section-header">Capacity</div>
      ${this._renderEntityField("capacity_remaining", "Remaining Capacity", ["sensor"])}
      ${this._renderEntityField("capacity_full", "Full Capacity", ["sensor"])}
      ${this._renderEntityField("cycle_count", "Cycle Count", ["sensor"])}

      <div class="section-header">Temperature</div>
      ${this._renderEntityField("temp_mos", "MOS Temperature", ["sensor"])}
      ${this._renderEntityField("temp_env", "Environment Temperature", ["sensor"])}

      <div class="section-header">Status</div>
      ${this._renderEntityField("charging", "Charging Status", ["binary_sensor", "switch"])}
      ${this._renderEntityField("discharging", "Discharging Status", ["binary_sensor", "switch"])}
      ${this._renderEntityField("balancing_active", "Balancing Active", ["binary_sensor"])}

      <div class="section-header">Cell Voltage Overrides</div>
      <div class="help-text" style="margin-bottom: 8px;">
        Override individual cell voltage entities. Leave empty to use the pattern.
      </div>
      ${this._renderCellVoltageOverrides()}
    `;
  }

  /**
   * Render cell voltage override fields based on cell count
   */
  private _renderCellVoltageOverrides(): TemplateResult {
    const cellCount = this._config.cells?.count || 16;
    const cellVoltages = this._config.entities?.cell_voltages;
    
    // Get existing values if it's an array
    const existingValues: string[] = Array.isArray(cellVoltages) ? cellVoltages : [];

    const cells = [];
    for (let i = 0; i < cellCount; i++) {
      cells.push(html`
        <div class="form-group cell-override">
          <label>Cell ${i + 1}</label>
          <ha-selector
            .hass=${this.hass}
            .selector=${{ entity: { domain: ["sensor"] } }}
            .value=${existingValues[i] || ""}
            @value-changed=${(e: CustomEvent) => this._updateCellVoltage(i, e.detail.value || "")}
          ></ha-selector>
        </div>
      `);
    }

    return html`<div class="cell-grid-overrides">${cells}</div>`;
  }

  /**
   * Render an entity field using ha-entity-picker for better UX
   */
  private _renderEntityField(key: string, label: string, domainFilter?: string[]): TemplateResult {
    const value = this._config.entities?.[key as keyof typeof this._config.entities] || "";
    
    return html`
      <div class="form-group">
        <label>${label}</label>
        <ha-selector
          .hass=${this.hass}
          .selector=${{ entity: { domain: domainFilter } }}
          .value=${typeof value === "string" ? value : ""}
          @value-changed=${(e: CustomEvent) => this._updateEntity(key, e.detail.value || "")}
        ></ha-selector>
      </div>
    `;
  }

  // ============================================================================
  // Config Update Methods
  // ============================================================================

  private _updateConfig(key: string, value: unknown): void {
    this._config = { ...this._config, [key]: value };
    this._fireConfigChanged();
  }

  private _updateEntityPattern(key: string, value: string): void {
    this._config = {
      ...this._config,
      entity_pattern: {
        ...this._config.entity_pattern,
        [key]: value,
      },
    };
    this._fireConfigChanged();
  }

  private _updateCellConfig(key: string, value: unknown): void {
    this._config = {
      ...this._config,
      cells: {
        ...this._config.cells,
        [key]: value,
      },
    };
    this._fireConfigChanged();
  }

  private _updateThreshold(key: string, value: number): void {
    if (isNaN(value)) return;
    this._config = {
      ...this._config,
      thresholds: {
        ...this._config.thresholds,
        [key]: value,
      },
    };
    this._fireConfigChanged();
  }

  private _updateTemperature(key: string, value: number): void {
    if (isNaN(value)) return;
    this._config = {
      ...this._config,
      temperature: {
        ...this._config.temperature,
        [key]: value,
      },
    };
    this._fireConfigChanged();
  }

  private _updateDisplay(key: string, value: unknown): void {
    this._config = {
      ...this._config,
      display: {
        ...this._config.display,
        [key]: value,
      },
    };
    this._fireConfigChanged();
  }

  private _updateEntity(key: string, value: string): void {
    const entities = { ...this._config.entities };
    if (value) {
      (entities as Record<string, unknown>)[key] = value;
    } else {
      delete (entities as Record<string, unknown>)[key];
    }
    this._config = { ...this._config, entities };
    this._fireConfigChanged();
  }

  private _updateCellVoltage(index: number, value: string): void {
    const entities = { ...this._config.entities };
    const cellCount = this._config.cells?.count || 16;
    
    // Get existing array or create new one
    let cellVoltages: string[] = [];
    if (Array.isArray(entities.cell_voltages)) {
      cellVoltages = [...entities.cell_voltages];
    } else {
      // Initialize with empty strings
      cellVoltages = new Array(cellCount).fill("");
    }

    // Ensure array is large enough
    while (cellVoltages.length < cellCount) {
      cellVoltages.push("");
    }

    // Update the specific cell
    cellVoltages[index] = value;

    // Check if all values are empty - if so, remove the array entirely
    const hasAnyValue = cellVoltages.some(v => v && v.length > 0);
    if (hasAnyValue) {
      entities.cell_voltages = cellVoltages;
    } else {
      delete entities.cell_voltages;
    }

    this._config = { ...this._config, entities };
    this._fireConfigChanged();
  }

  private _fireConfigChanged(): void {
    fireEvent(this, "config-changed", { config: this._config });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-bms-card-editor": HABMSCardEditor;
  }
}
