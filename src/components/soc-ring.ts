/**
 * Generic BMS Card - SOC Ring Component
 * Circular state of charge gauge with remaining capacity
 */

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { socRingStyles } from "../styles";
import { formatSoc, formatCapacity } from "../utils/format";
import { getSocState } from "../utils/threshold";

@customElement("bms-soc-ring")
export class BMSSocRing extends LitElement {
  @property({ type: Number }) soc: number | null = null;
  @property({ type: Number }) remaining: number | null = null;
  @property({ type: Boolean }) hasAlarm = false;
  @property({ type: String }) entityId = "";

  static styles = [
    socRingStyles,
    css`
      .soc-container.clickable {
        cursor: pointer;
      }
      .soc-container.clickable:hover {
        opacity: 0.8;
      }
    `
  ];

  protected render() {
    const soc = this.soc ?? 0;
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (soc / 100) * circumference;
    const ringClass = getSocState(this.soc, this.hasAlarm);
    const isClickable = !!this.entityId;

    return html`
      <div 
        class="soc-container ${isClickable ? 'clickable' : ''}" 
        role="meter" 
        aria-valuenow="${soc}" 
        aria-valuemin="0" 
        aria-valuemax="100" 
        aria-label="State of charge"
        @click=${isClickable ? this._handleClick : undefined}
      >
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

  private _handleClick(): void {
    if (this.entityId) {
      this.dispatchEvent(
        new CustomEvent("hass-more-info", {
          bubbles: true,
          composed: true,
          detail: { entityId: this.entityId },
        })
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "bms-soc-ring": BMSSocRing;
  }
}
