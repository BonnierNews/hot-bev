"use strict";

const isInteractive = require("is-interactive");
const Mocha = require("mocha");
const print = require("./print");

const Base = Mocha.reporters.base;
const {
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
} = Mocha.Runner.constants;

module.exports = isInteractive() ?
  InteractiveReporter :
  NonInteractiveReporter;

function InteractiveReporter (runner, options) {
  Base.call(this, runner, options);
  const stats = this.stats;
  const isParallelMode = runner.isParallelMode();
  const total = isParallelMode ? null : runner.total;
  let statusLineCount = print.status(total, stats);

  runner
    .on(EVENT_TEST_PASS, update)
    .on(EVENT_TEST_FAIL, update)
    .once(EVENT_RUN_END, end);

  function update (test, err) {
    print.clear(statusLineCount);
    if (err) print.error(stats.failures, test);
    statusLineCount = print.status(total, stats);
  }

  function end (test, err) {
    print.clear(statusLineCount);
    if (err) print.error(stats.failures, test);
    const total = isParallelMode ? calculateTotalFromStats(stats) : runner.total;
    statusLineCount = print.status(total, stats);
  }
}

function NonInteractiveReporter (runner, options) {
  Base.call(this, runner, options);
  const stats = this.stats;
  const isParallelMode = runner.isParallelMode();

  if (!isParallelMode) {
    print.total(runner.total);
  }

  runner.once(EVENT_RUN_END, () => {
    if (isParallelMode) {
      print.total(calculateTotalFromStats(stats));
    }

    print.result(stats);
    print.errors(this.failures);
  });
}

function calculateTotalFromStats(stats) {
  return stats.passes + stats.failures + stats.pending;
}

