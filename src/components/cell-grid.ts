/**
 * Generic BMS Card - Cell Grid Component
 * Displays cell voltages in a configurable grid layout
 */

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { cellGridStyles } from "../styles";
import { CellData, Thresholds } from "../types";
import { formatVoltage, formatCellNumber } from "../utils/format";
import {
  evaluateVoltageState,
  getVoltageColor,
  calculateBarWidth,
  isMinCell,
  isMaxCell,
} from "../utils/threshold";

@customElement("bms-cell-grid")
export class BMSCellGrid extends LitElement {
  @property({ type: Array }) cells: CellData[] = [];
  @property({ type: Number }) columns = 2;
  @property({ type: Number }) columnsMobile = 0; // 0 means use columns value
  @property({ type: String }) layout: "incremental" | "bank" = "bank";
  @property({ type: String }) orientation: "horizontal" | "vertical" = "horizontal";
  @property({ type: Object }) thresholds!: Thresholds;
  @property({ type: Number }) minCellNumber: number | null = null;
  @property({ type: Number }) maxCellNumber: number | null = null;
  @property({ type: Array }) entityIds: string[] = [];

  static styles = [
    cellGridStyles,
    css`
      .cell-item.clickable {
        cursor: pointer;
      }
      .cell-item.clickable:hover {
        background: var(--secondary-background-color, rgba(255, 255, 255, 0.05));
      }
    `
  ];

  protected render() {
    const mobileColumns = this.columnsMobile || this.columns;
    const orderedCells = this._getOrderedCells();

    return html`
      <style>
        .cell-grid {
          grid-template-columns: repeat(${this.columns}, 1fr);
        }
        @media (max-width: 600px) {
          .cell-grid {
            grid-template-columns: repeat(${mobileColumns}, 1fr);
          }
        }
      </style>
      <div class="cell-grid" role="list" aria-label="Cell voltages">
        ${orderedCells.map((cell, index) => this._renderCell(cell, index))}
      </div>
    `;
  }

  /**
   * Order cells based on layout mode
   * - incremental: 1,2,3,4... across columns then rows
   * - bank: split into columns (col1=1-8, col2=9-16 for 16 cells/2 cols)
   */
  private _getOrderedCells(): CellData[] {
    if (this.layout === "incremental") {
      return [...this.cells];
    }

    // Bank mode: cells are grouped into columns
    const cellsPerColumn = Math.ceil(this.cells.length / this.columns);
    const ordered: CellData[] = [];

    for (let row = 0; row < cellsPerColumn; row++) {
      for (let col = 0; col < this.columns; col++) {
        const index = col * cellsPerColumn + row;
        if (index < this.cells.length) {
          ordered.push(this.cells[index]);
        }
      }
    }

    return ordered;
  }

  /**
   * Render individual cell item
   */
  private _renderCell(cell: CellData, _index: number) {
    const voltage = cell.voltage;
    const isMin = isMinCell(cell.number, this.minCellNumber);
    const isMax = isMaxCell(cell.number, this.maxCellNumber);
    const stateClass = this.thresholds
      ? evaluateVoltageState(voltage, this.thresholds)
      : "";
    const barWidth = this.thresholds ? calculateBarWidth(voltage, this.thresholds) : 0;
    const barColor = this.thresholds ? getVoltageColor(evaluateVoltageState(voltage, this.thresholds)) : "var(--divider-color)";
    
    // Get entity ID for this cell (cell numbers are 1-based)
    const entityId = this.entityIds[cell.number - 1];
    const isClickable = !!entityId;

    const classes = [
      "cell-item",
      stateClass,
      isMin ? "is-min" : "",
      isMax ? "is-max" : "",
      isClickable ? "clickable" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <div 
        class="${classes}" 
        role="listitem"
        aria-label="Cell ${cell.number}: ${voltage !== null ? `${voltage.toFixed(3)}V` : 'unavailable'}${cell.balancing ? ', balancing' : ''}"
        @click=${isClickable ? () => this._handleCellClick(entityId) : undefined}
      >
        <span class="cell-number">${formatCellNumber(cell.number)}</span>
        <span class="cell-voltage">${formatVoltage(voltage)} V</span>
        <div class="cell-bar" aria-hidden="true">
          <div
            class="cell-bar-fill"
            style="width: ${barWidth}%; background: ${barColor};"
          ></div>
        </div>
        ${cell.balancing
          ? html`<div class="balancing-indicator" title="Balancing" aria-label="Cell is balancing"></div>`
          : ""}
      </div>
    `;
  }

  /**
   * Handle cell click - dispatch event to open more-info dialog
   */
  private _handleCellClick(entityId: string): void {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId },
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "bms-cell-grid": BMSCellGrid;
  }
}
