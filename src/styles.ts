/**
 * Generic BMS Card - Shared CSS Styles
 * Material You design system styles using Lit's css template
 */

import { css } from "lit";

/**
 * CSS custom properties with default values
 */
export const cssVariables = css`
  :host {
    /* Status Colors - Material You tonal palette */
    --bms-success: #4caf50;
    --bms-success-container: #c8e6c9;
    --bms-warning: #ff9800;
    --bms-warning-container: #ffe0b2;
    --bms-error: #f44336;
    --bms-error-container: #ffcdd2;
    --bms-info: #2196f3;
    --bms-info-container: #bbdefb;

    /* Cell voltage gradient stops */
    --bms-cell-low: #f44336;
    --bms-cell-nominal: #4caf50;
    --bms-cell-high: #ff9800;
    --bms-cell-critical: #9c27b0;

    /* Balancing indicator */
    --bms-balancing: #00bcd4;
    --bms-balancing-pulse: rgba(0, 188, 212, 0.5);

    /* Spacing */
    --bms-card-padding: 16px;
    --bms-section-gap: 12px;
    --bms-element-padding: 8px;

    /* Border radius */
    --bms-radius-card: 16px;
    --bms-radius-section: 12px;
    --bms-radius-element: 8px;
    --bms-radius-badge: 12px;

    /* Animation */
    --bms-transition-duration: 300ms;
    --bms-pulse-duration: 1.5s;
  }

  /* Compact mode overrides */
  :host(.compact) {
    --bms-card-padding: 12px;
    --bms-section-gap: 8px;
    --bms-element-padding: 6px;
  }
`;

/**
 * Main card layout styles
 */
export const cardStyles = css`
  ${cssVariables}

  :host {
    display: block;
    /* Dynamic width based on column count */
    --bms-base-width: 380px;
    --bms-column-width: 120px;
    --bms-columns: 2;
    max-width: calc(var(--bms-base-width) + (var(--bms-columns) - 2) * var(--bms-column-width));
  }

  ha-card {
    padding: var(--bms-card-padding);
    border-radius: var(--bms-radius-card);
    background: var(--ha-card-background, var(--card-background-color));
    color: var(--primary-text-color);
    box-sizing: border-box;
    overflow: hidden;
  }

  ha-card.compact {
    padding: 12px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--bms-section-gap);
    gap: 8px;
  }

  .card-header .title {
    font-size: 16px;
    font-weight: 500;
    color: var(--primary-text-color);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .alert-indicators {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: flex-end;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: var(--bms-section-gap);
  }

  /* Status Row (charge indicator - SOC ring - discharge indicator) */
  .status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--bms-element-padding) 0;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--bms-section-gap);
  }

  @media (max-width: 350px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Temperature Section */
  .temp-section {
    padding-top: var(--bms-element-padding);
    border-top: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
  }

  .temp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }

  /* Divider */
  .divider {
    height: 1px;
    background: var(--divider-color, rgba(255, 255, 255, 0.1));
    margin: var(--bms-element-padding) 0;
  }

  /* Hidden element */
  .hidden {
    display: none !important;
  }
`;

/**
 * SOC Ring component styles
 */
export const socRingStyles = css`
  ${cssVariables}

  :host {
    display: block;
  }

  .soc-container {
    position: relative;
    width: 140px;
    height: 140px;
  }

  svg {
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;
  }

  .ring-bg {
    fill: none;
    stroke: var(--divider-color, rgba(255, 255, 255, 0.1));
    stroke-width: 8;
  }

  .ring-progress {
    fill: none;
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease;
  }

  .ring-progress.healthy {
    stroke: var(--bms-success);
  }

  .ring-progress.warning {
    stroke: var(--bms-warning);
  }

  .ring-progress.critical {
    stroke: var(--bms-error);
  }

  .ring-progress.alarm {
    stroke: var(--bms-error);
    animation: alarm-pulse var(--bms-pulse-duration) ease-in-out infinite;
  }

  @keyframes alarm-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .soc-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .soc-label {
    font-size: 12px;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .soc-value {
    font-size: 28px;
    font-weight: 500;
    color: var(--primary-text-color);
    line-height: 1.2;
  }

  .soc-remaining {
    font-size: 14px;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }
`;

/**
 * Status indicator component styles
 */
export const statusIndicatorStyles = css`
  ${cssVariables}

  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 60px;
  }

  .indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    opacity: 0.4;
    transition: opacity var(--bms-transition-duration) ease;
  }

  .indicator.active {
    opacity: 1;
  }

  .icon-container {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--divider-color, rgba(255, 255, 255, 0.1));
    transition: background-color var(--bms-transition-duration) ease;
  }

  .indicator.active .icon-container {
    background: var(--bms-success-container);
  }

  .indicator.active.charge .icon-container {
    background: var(--bms-info-container);
  }

  svg.icon {
    width: 24px;
    height: 24px;
    fill: var(--secondary-text-color);
    transition: fill var(--bms-transition-duration) ease;
  }

  .indicator.active svg.icon {
    fill: var(--bms-success);
  }

  .indicator.active.charge svg.icon {
    fill: var(--bms-info);
  }

  .label {
    font-size: 11px;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Power flow arrow */
  .power-flow {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 16px;
    min-width: 30px;
    position: relative;
    overflow: hidden;
  }

  .power-flow .arrow {
    width: 16px;
    height: 16px;
    fill: var(--secondary-text-color);
    opacity: 0.3;
  }

  /* Charge arrow points RIGHT (toward SOC ring in center) */
  .indicator.charge .power-flow .arrow {
    /* Arrow already points right by default */
  }

  /* Discharge arrow points RIGHT (away from SOC ring toward Load) */
  .indicator.discharge .power-flow .arrow {
    /* Arrow already points right by default */
  }

  .indicator.active .power-flow .arrow {
    opacity: 1;
  }

  .indicator.active.charge .power-flow .arrow {
    fill: var(--bms-info);
    animation: flow-right 1s ease-in-out infinite;
  }

  .indicator.active.discharge .power-flow .arrow {
    fill: var(--bms-success);
    animation: flow-right 1s ease-in-out infinite;
  }

  /* Flowing dots animation */
  .flow-dots {
    display: none;
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .indicator.active .flow-dots {
    display: block;
  }

  .flow-dot {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%);
  }

  .indicator.active.charge .flow-dot {
    background: var(--bms-info);
    animation: dot-flow-right 1.2s ease-in-out infinite;
  }

  .indicator.active.discharge .flow-dot {
    background: var(--bms-success);
    animation: dot-flow-right 1.2s ease-in-out infinite;
  }

  .flow-dot:nth-child(1) { animation-delay: 0s; }
  .flow-dot:nth-child(2) { animation-delay: 0.4s; }
  .flow-dot:nth-child(3) { animation-delay: 0.8s; }

  @keyframes flow-right {
    0%, 100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(3px);
    }
  }

  @keyframes dot-flow-right {
    0% {
      left: 0%;
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      left: 100%;
      opacity: 0;
    }
  }
`;

/**
 * Stat card component styles
 */
export const statCardStyles = css`
  ${cssVariables}

  :host {
    display: block;
  }

  .stat-card {
    background: var(--ha-card-background, var(--card-background-color));
    border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
    border-radius: var(--bms-radius-section);
    padding: var(--bms-element-padding) 12px;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
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
    color: var(--bms-warning);
  }

  .stat-value.critical {
    color: var(--bms-error);
  }

  .stat-unit {
    font-size: 12px;
    color: var(--secondary-text-color);
    font-weight: normal;
    margin-left: 2px;
  }

  .divider {
    height: 1px;
    background: var(--divider-color, rgba(255, 255, 255, 0.1));
    margin: 8px 0;
  }
`;

/**
 * Cell grid component styles
 */
export const cellGridStyles = css`
  ${cssVariables}

  :host {
    display: block;
  }

  .cell-grid {
    display: grid;
    gap: 4px;
  }

  .cell-item {
    display: flex;
    align-items: center;
    padding: 6px 8px;
    background: var(--ha-card-background, var(--card-background-color));
    border-radius: var(--bms-radius-element);
    border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
    transition: background-color var(--bms-transition-duration) ease;
    min-width: 0;
  }

  .cell-number {
    font-size: 11px;
    font-weight: 500;
    font-family: var(--paper-font-common-code_-_font-family, monospace);
    min-width: 20px;
    padding: 2px 4px;
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-radius: 4px;
    text-align: center;
    flex-shrink: 0;
  }

  .cell-voltage {
    flex: 1;
    font-size: 13px;
    font-family: var(--paper-font-common-code_-_font-family, monospace);
    margin-left: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cell-bar {
    width: 50px;
    height: 5px;
    background: var(--divider-color, rgba(255, 255, 255, 0.1));
    border-radius: 3px;
    overflow: hidden;
    margin-left: 6px;
    flex-shrink: 0;
  }

  .cell-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width var(--bms-transition-duration) ease,
      background-color var(--bms-transition-duration) ease;
  }

  .balancing-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-left: 6px;
    background: var(--bms-balancing);
    animation: pulse var(--bms-pulse-duration) ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(0.8);
    }
  }

  /* Min/Max highlighting */
  .cell-item.is-min .cell-voltage {
    color: var(--bms-info);
    font-weight: 500;
  }

  .cell-item.is-min::before {
    content: "▼";
    font-size: 8px;
    color: var(--bms-info);
    margin-right: 4px;
  }

  .cell-item.is-max .cell-voltage {
    color: var(--bms-warning);
    font-weight: 500;
  }

  .cell-item.is-max::before {
    content: "▲";
    font-size: 8px;
    color: var(--bms-warning);
    margin-right: 4px;
  }

  /* Voltage state colors */
  .cell-item.critical-low .cell-number {
    background: var(--bms-error);
  }
  .cell-item.warning-low .cell-number {
    background: var(--bms-warning);
  }
  .cell-item.warning-high .cell-number {
    background: var(--bms-warning);
  }
  .cell-item.critical-high .cell-number {
    background: var(--bms-cell-critical);
  }
`;

/**
 * Alert badge component styles
 */
export const alertBadgeStyles = css`
  ${cssVariables}

  :host {
    display: inline-block;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: var(--bms-radius-badge);
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  .badge.warning {
    background: var(--bms-warning-container);
    color: var(--bms-warning);
  }

  .badge.critical {
    background: var(--bms-error-container);
    color: var(--bms-error);
    animation: badge-pulse var(--bms-pulse-duration) ease-in-out infinite;
  }

  @keyframes badge-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  .icon {
    width: 10px;
    height: 10px;
    margin-right: 4px;
    flex-shrink: 0;
  }
`;

/**
 * Temperature bar component styles
 */
export const tempBarStyles = css`
  ${cssVariables}

  :host {
    display: block;
  }

  .temp-bar {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 8px;
    background: var(--ha-card-background, var(--card-background-color));
    border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
    border-radius: var(--bms-radius-element);
  }

  .temp-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .temp-label {
    font-size: 11px;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .temp-value {
    font-size: 13px;
    font-weight: 500;
    font-family: var(--paper-font-common-code_-_font-family, monospace);
    color: var(--primary-text-color);
  }

  .temp-value.warning {
    color: var(--bms-warning);
  }

  .temp-value.critical {
    color: var(--bms-error);
  }

  .temp-progress {
    height: 3px;
    background: var(--divider-color, rgba(255, 255, 255, 0.1));
    border-radius: 2px;
    overflow: hidden;
  }

  .temp-progress-fill {
    height: 100%;
    border-radius: 2px;
    transition: width var(--bms-transition-duration) ease,
      background-color var(--bms-transition-duration) ease;
  }

  .temp-progress-fill.normal {
    background: var(--bms-success);
  }

  .temp-progress-fill.warning {
    background: var(--bms-warning);
  }

  .temp-progress-fill.critical {
    background: var(--bms-error);
  }
`;

/**
 * Combined styles export for main card
 */
export const styles = cardStyles;
