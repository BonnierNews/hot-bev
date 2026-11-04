"use strict";

const Mocha = require("mocha");
const print = require("./print");

const Base = Mocha.reporters.base;
const {
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
} = Mocha.Runner.constants;

class InteractiveReporter extends Base {
  constructor (runner, options) {
    super(runner, options);
    const stats = this.stats;
    const isParallelMode = runner.isParallelMode && runner.isParallelMode();
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
}

class NonInteractiveReporter extends Base {
  constructor (runner, options) {
    super(runner, options);
    const stats = this.stats;
    const isParallelMode = runner.isParallelMode && runner.isParallelMode();

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
}

module.exports = isInteractive() ?
  InteractiveReporter :
  NonInteractiveReporter;

function isInteractive () {
  return Boolean(
    process.stdout.isTTY &&
    process.env.TERM !== "dumb" &&
    !("CI" in process.env)
  );
}

function calculateTotalFromStats (stats) {
  return stats.passes + stats.failures + stats.pending;
}
