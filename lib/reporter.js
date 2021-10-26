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
  const total = runner.isParallelMode() ? null : runner.total;
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
    statusLineCount = print.status(getTotal(runner, stats), stats);
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

function getTotal(runner, stats) {
  return runner.isParallelMode() ? calculateTotalFromStats(stats) : runner.total;
}

function calculateTotalFromStats(stats) {
  return stats.passes + stats.failures + stats.pending;
}

