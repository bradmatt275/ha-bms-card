/**
 * Generic BMS Card - SOC Ring Component
 * Circular state of charge gauge with remaining capacity
 */

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { socRingStyles } from "../styles";
import { formatSoc, formatCapacity } from "../utils/format";
import { getSocState } from "../utils/threshold";

@customElement("bms-soc-ring")
export class BMSSocRing extends LitElement {
  @property({ type: Number }) soc: number | null = null;
  @property({ type: Number }) remaining: number | null = null;
  @property({ type: Boolean }) hasAlarm = false;

  static styles = socRingStyles;

  protected render() {
    const soc = this.soc ?? 0;
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (soc / 100) * circumference;
    const ringClass = getSocState(this.soc, this.hasAlarm);

    return html`
      <div class="soc-container" role="meter" aria-valuenow="${soc}" aria-valuemin="0" aria-valuemax="100" aria-label="State of charge">
        <svg viewBox="0 0 140 140" aria-hidden="true">
          <circle class="ring-bg" cx="70" cy="70" r="${radius}" />
          <circle
            class="ring-progress ${ringClass}"
            cx="70"
            cy="70"
            r="${radius}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
          />
        </svg>
        <div class="soc-text">
          <div class="soc-label">SOC</div>
          <div class="soc-value">${formatSoc(this.soc)}%</div>
          ${this.remaining !== null
            ? html`<div class="soc-remaining">${formatCapacity(this.remaining)} Ah</div>`
            : ""}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "bms-soc-ring": BMSSocRing;
  }
}
