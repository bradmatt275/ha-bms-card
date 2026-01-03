/**
 * Generic BMS Card - Temperature Bar Component
 * Displays temperature sensor with progress bar
 */

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { tempBarStyles } from "../styles";
import { formatTemperature, clamp } from "../utils/format";

@customElement("bms-temp-bar")
export class BMSTempBar extends LitElement {
  @property({ type: String }) label = "";
  @property({ type: Number }) value: number | null = null;
  @property({ type: Number }) warning = 40;
  @property({ type: Number }) critical = 50;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 60;

  static styles = tempBarStyles;

  protected render() {
    const state = this._getState();
    const progressWidth = this._getProgressWidth();

    return html`
      <div class="temp-bar" role="meter" aria-valuenow="${this.value ?? 0}" aria-valuemin="${this.min}" aria-valuemax="${this.max}" aria-label="${this.label} temperature">
        <div class="temp-header">
          <span class="temp-label">${this.label}</span>
          <span class="temp-value ${state}">${formatTemperature(this.value)}°C</span>
        </div>
        <div class="temp-progress" aria-hidden="true">
          <div
            class="temp-progress-fill ${state}"
            style="width: ${progressWidth}%;"
          ></div>
        </div>
      </div>
    `;
  }

  /**
   * Get temperature state based on thresholds
   */
  private _getState(): "normal" | "warning" | "critical" {
    if (this.value === null) return "normal";
    if (this.value >= this.critical) return "critical";
    if (this.value >= this.warning) return "warning";
    return "normal";
  }

  /**
   * Calculate progress bar width percentage
   */
  private _getProgressWidth(): number {
    if (this.value === null) return 0;
    const range = this.max - this.min;
    if (range === 0) return 0;
    return clamp(((this.value - this.min) / range) * 100, 0, 100);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "bms-temp-bar": BMSTempBar;
  }
}
