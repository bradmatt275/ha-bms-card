/**
 * Generic BMS Card - Stat Card Component
 * Displays labeled statistics (voltage, current, power, etc.)
 */

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { statCardStyles } from "../styles";
import { formatNumber } from "../utils/format";

@customElement("bms-stat-card")
export class BMSStatCard extends LitElement {
  static styles = statCardStyles;

  protected render() {
    return html`
      <div class="stat-card">
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Individual stat display
 */
@customElement("bms-stat")
export class BMSStat extends LitElement {
  @property({ type: String }) label = "";
  @property({ type: Number }) value: number | null = null;
  @property({ type: String }) unit = "";
  @property({ type: String }) size: "normal" | "large" = "normal";
  @property({ type: Boolean }) warning = false;
  @property({ type: Boolean }) critical = false;
  @property({ type: Number }) decimals = 2;

  static styles = css`
    :host {
      display: block;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 4px 0;
    }

    .stat.large {
      flex: 1;
    }

    .stat-label {
      font-size: 11px;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value-container {
      display: flex;
      align-items: baseline;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
      font-family: var(--paper-font-common-code_-_font-family, monospace);
    }

    .stat.large .stat-value {
      font-size: 20px;
    }

    .stat-value.warning {
      color: var(--bms-warning, #ff9800);
    }

    .stat-value.critical {
      color: var(--bms-error, #f44336);
    }

    .stat-unit {
      font-size: 12px;
      color: var(--secondary-text-color);
      font-weight: normal;
      margin-left: 2px;
    }
  `;

  protected render() {
    const valueClass = this.critical ? "critical" : this.warning ? "warning" : "";
    const formattedValue = this._formatValue();

    return html`
      <div class="stat ${this.size}">
        <span class="stat-label">${this.label}</span>
        <div class="stat-value-container">
          <span class="stat-value ${valueClass}">${formattedValue}</span>
          ${this.unit ? html`<span class="stat-unit">${this.unit}</span>` : ""}
        </div>
      </div>
    `;
  }

  private _formatValue(): string {
    if (this.value === null || this.value === undefined) {
      return "---";
    }
    return formatNumber(this.value, this.decimals);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "bms-stat-card": BMSStatCard;
    "bms-stat": BMSStat;
  }
}
