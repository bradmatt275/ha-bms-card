/**
 * Generic BMS Card - Cell Grid Component
 * Displays cell voltages in a configurable grid layout
 */

import { LitElement, html } from "lit";
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
  @property({ type: String }) layout: "incremental" | "bank" = "bank";
  @property({ type: String }) orientation: "horizontal" | "vertical" = "horizontal";
  @property({ type: Object }) thresholds!: Thresholds;
  @property({ type: Number }) minCellNumber: number | null = null;
  @property({ type: Number }) maxCellNumber: number | null = null;

  static styles = cellGridStyles;

  protected render() {
    const gridStyle = this._getGridStyle();
    const orderedCells = this._getOrderedCells();

    return html`
      <div class="cell-grid" style="${gridStyle}" role="list" aria-label="Cell voltages">
        ${orderedCells.map((cell) => this._renderCell(cell))}
      </div>
    `;
  }

  /**
   * Generate CSS grid style based on column count
   */
  private _getGridStyle(): string {
    return `grid-template-columns: repeat(${this.columns}, 1fr);`;
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
  private _renderCell(cell: CellData) {
    const voltage = cell.voltage;
    const isMin = isMinCell(cell.number, this.minCellNumber);
    const isMax = isMaxCell(cell.number, this.maxCellNumber);
    const stateClass = this.thresholds
      ? evaluateVoltageState(voltage, this.thresholds)
      : "";
    const barWidth = this.thresholds ? calculateBarWidth(voltage, this.thresholds) : 0;
    const barColor = this.thresholds ? getVoltageColor(evaluateVoltageState(voltage, this.thresholds)) : "var(--divider-color)";

    const classes = [
      "cell-item",
      stateClass,
      isMin ? "is-min" : "",
      isMax ? "is-max" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <div 
        class="${classes}" 
        role="listitem"
        aria-label="Cell ${cell.number}: ${voltage !== null ? `${voltage.toFixed(3)}V` : 'unavailable'}${cell.balancing ? ', balancing' : ''}"
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
}

declare global {
  interface HTMLElementTagNameMap {
    "bms-cell-grid": BMSCellGrid;
  }
}
