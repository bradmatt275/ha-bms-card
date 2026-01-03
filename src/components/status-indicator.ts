/**
 * Generic BMS Card - Status Indicator Component
 * Shows charge/discharge status with animated icons
 */

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { statusIndicatorStyles } from "../styles";

@customElement("bms-status-indicator")
export class BMSStatusIndicator extends LitElement {
  @property({ type: String }) type: "charge" | "discharge" = "charge";
  @property({ type: Boolean }) active = false;
  @property({ type: String }) label = "";

  static styles = statusIndicatorStyles;

  protected render() {
    const isCharge = this.type === "charge";

    return html`
      <div 
        class="indicator ${this.type} ${this.active ? "active" : ""}"
        role="status"
        aria-label="${this.label}: ${this.active ? 'active' : 'inactive'}"
      >
        <div class="icon-container">
          ${isCharge ? this._renderChargeIcon() : this._renderDischargeIcon()}
        </div>
        <span class="label">${this.label}</span>
        ${this._renderPowerFlow()}
      </div>
    `;
  }

  private _renderChargeIcon() {
    // Grid/solar icon for charging input
    return html`
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11,21H7V19H11V21M15.5,19H12.5V17H15.5V19M19,17H16V15H19V17M12,3C7.03,3 3,7.03 3,12H0L4,16L8,12H5C5,8.13 8.13,5 12,5C15.87,5 19,8.13 19,12H16L20,16L24,12H21C21,7.03 16.97,3 12,3Z" />
      </svg>
    `;
  }

  private _renderDischargeIcon() {
    // Home/load icon for discharging
    return html`
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
      </svg>
    `;
  }

  private _renderPowerFlow() {
    // Power flow indicator with arrow and animated dots
    return html`
      <div class="power-flow">
        <div class="flow-dots">
          <span class="flow-dot"></span>
          <span class="flow-dot"></span>
          <span class="flow-dot"></span>
        </div>
        <svg class="arrow" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
        </svg>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "bms-status-indicator": BMSStatusIndicator;
  }
}
