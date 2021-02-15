import * as print from "./print.js";
import Mocha from "mocha";

const Base = Mocha.reporters.base;
const {
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
} = Mocha.Runner.constants;

export default function Reporter (runner, options) {
  Base.call(this, runner, options);

  let statusLineCount = 0;
  const stats = this.stats;

  printStatus(stats);
  runner
    .on(EVENT_TEST_PASS, update)
    .on(EVENT_TEST_FAIL, update)
    .once(EVENT_RUN_END, update);

  function update (test, err) {
    print.clear(statusLineCount);
    if (err) print.error(stats.failures, test);
    statusLineCount = print.status(stats, runner.total);
  }
}
