"use strict";

const Mocha = require("mocha");
const print = require("./print");

const Base = Mocha.reporters.base;
const {
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
} = Mocha.Runner.constants;

module.exports = function Reporter (runner, options) {
  Base.call(this, runner, options);
  const stats = this.stats;
  let statusLineCount = print.status(stats, runner.total);

  runner
    .on(EVENT_TEST_PASS, update)
    .on(EVENT_TEST_FAIL, update)
    .once(EVENT_RUN_END, update);

  function update (test, err) {
    print.clear(statusLineCount);
    if (err) print.error(stats.failures, test);
    statusLineCount = print.status(stats, runner.total);
  }
};
