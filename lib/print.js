"use strict";

const Mocha = require("mocha");
const readline = require("readline");
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
  errors,
  status,
  total,
  result,
};

function clear (lineCount) {
  readline.moveCursor(process.stdout, 0, -1 * lineCount);
  readline.clearScreenDown(process.stdout);
}

function error (order, test) {
  readline.moveCursor(process.stdout, 0, -1);
  Base.list({
    forEach: print => print(test, order - 1)
  });
}

function errors (tests) {
  Base.list(tests);
}

function status (total, stats, isParallelMode) {
  const rows = [
    ...(isParallelMode ? [] : [["Total", total, "±"]]),
    ["Passing", stats.passes, Base.color("bright pass", "✓")],
    ["Failing", stats.failures, Base.color("bright fail", "✗")],
  ];

  if (stats.pending)
    rows.push(["Pending", stats.pending, Base.color("pending", "∗")]);
  if (stats.duration)
    rows.push(["Time", ...timestamp(stats.duration)]);

  return table(rows, true, {bottom: stats.duration ? 1 : 0});
}

function total (total) {
  const rows = [
    ["Total", total, "±"],
  ];
  return table(rows, false);
}

function result (stats) {
  const rows = [
    ["Passing", stats.passes, Base.color("bright pass", "✓")],
    ["Failing", stats.failures, Base.color("bright fail", "✗")],
    ["Pending", stats.pending, Base.color("pending", "∗")],
    ["Time", ...timestamp(stats.duration)],
  ];
  return table(rows, false);
}

function table (rows, alignRight, pad = {}) {
  pad = {...defaultPad, ...pad};
  const columnWidths = alignRight ?
    getColumnWidths(rows) :
    [0, 0, 0];

  let output = "";
  output += "\n".repeat(pad.top);
  output += rows
    .map(format)
    .join("\n");
  output += "\n".repeat(1 + pad.bottom);
  process.stdout.write(output);

  return pad.top + rows.length + pad.bottom;

  function format ([key, value, symbol]) {
    const padding = " ".repeat(pad.left || 0);
    key = (key + ":").padEnd(columnWidths[0] + 1);
    value = String(value || 0).padStart(columnWidths[1]);
    return `${padding}${key} ${value} ${symbol}`;
  }
}

function getColumnWidths (rows) {
  const widths = [];

  for (const columns of rows) {
    for (const [index, cell] of columns.entries()) {
      widths[index] = Math.max(widths[index] || 0, String(cell || "").length);
    }
  }

  return widths;
}
