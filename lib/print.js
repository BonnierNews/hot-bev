"use strict";

const Mocha = require("mocha");
const timestamp = require("./timestamp");

const Base = Mocha.reporters.base;

const defaultPad = {
  left: 2,
  top: 0,
  bottom: 0,
};

module.exports = {
  clear,
  error,
  status,
};

function clear (lineCount) {
  process.stdout.moveCursor(0, -1 * lineCount + 1);
  process.stdout.clearScreenDown();
}

function error (order, test) {
  Base.list({
    forEach: print => print(test, order)
  });
}

function status (stats, total) {
  const data = {};
  data.passing = [stats.passes, Base.color("bright pass", "✓")];
  data.failing = [stats.failures, Base.color("bright fail", "✗")];
  if (stats.pending) {
    data.pending = [stats.pending, Base.color("pending", "∗")];
  }
  data.total = [total, "±"];

  if (stats.duration) {
    data.time = timestamp(stats.duration)
      .split(/\s(?=\w+$)/);
  }

  return table(data, {
    top: 1,
    bottom: status.duration ? 2 : 3
  });
}

function table (data, pad = {}) {
  pad = {...defaultPad, ...pad};
  const rows = Object.entries(data)
    .map(normalize)
    .filter(Boolean);

  const columnWidths = getColumnWidths(rows);

  let output = "";
  output += "\n".repeat(pad.top);
  output += rows
    .map(format)
    .join("\n");
  output += "\n".repeat(pad.bottom);
  process.stdout.write(output);

  return pad.top + rows.length + pad.bottom;

  function normalize ([key, cells]) {
    if (!cells) return;
    let [value, symbol] = cells;
    value = typeof value === "undefined" ? "" : String(value);
    return [key, value, symbol || " "];
  }

  function format ([key, value, symbol]) {
    const padding = " ".repeat(pad.left || 0);
    key = key.charAt(0).toUpperCase() + key.slice(1);
    key = (key + ":").padEnd(columnWidths[0] + 1);
    value = value.padStart(columnWidths[1]);
    return `${padding}${key} ${value} ${symbol}`;
  }
}

function getColumnWidths (rows) {
  const widths = [];

  for (const columns of rows) {
    for (const [index, cell] of columns.entries()) {
      widths[index] = Math.max(widths[index] || 0, cell.length);
    }
  }

  return widths;
}
