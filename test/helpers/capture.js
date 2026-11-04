"use strict";

const {reporters: {Base}} = require("mocha");

// Collects everything written to stdout while fn runs, with colors disabled.
// Must stay synchronous so the reporter running these tests is not captured.
module.exports = function capture (fn) {
  const write = process.stdout.write;
  const useColors = Base.useColors;
  let output = "";

  process.stdout.write = (chunk) => {
    output += chunk;
    return true;
  };
  Base.useColors = false;

  try {
    const result = fn();
    return {output, result};
  } finally {
    process.stdout.write = write;
    Base.useColors = useColors;
  }
};
