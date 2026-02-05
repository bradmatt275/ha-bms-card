/**
 * Generic BMS Card - Alert Badge Component
 * Displays warning/critical alarm indicators
 */

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { alertBadgeStyles } from "../styles";

@customElement("bms-alert-badge")
export class BMSAlertBadge extends LitElement {
  @property({ type: String }) label = "";
  @property({ type: String }) severity: "warning" | "critical" = "warning";
  @property({ type: String }) message = "";

  static styles = alertBadgeStyles;

  protected render() {
    const displayText = this.message
      ? `${this.label}: ${this.message}`
      : this.label;

    return html`
      <span class="badge ${this.severity}" role="alert" aria-label="${displayText} ${this.severity}">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16"
          />
        </svg>
        ${displayText}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "bms-alert-badge": BMSAlertBadge;
  }
}
