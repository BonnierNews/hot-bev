"use strict";

const {strict: assert} = require("assert");
const runMocha = require("./helpers/run-mocha");

const reporterPath = require.resolve("../lib/reporter");
// Cursor up N lines and clear screen down, written when the status is redrawn
const redraw = /\x1b\[\d+A\x1b\[0J/; // eslint-disable-line no-control-regex

describe("reporter", () => {
  describe("mode selection", () => {
    const originalModule = require.cache[reporterPath];
    const originalIsTTY = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
    const originalEnv = {CI: process.env.CI, TERM: process.env.TERM};

    afterEach(() => {
      require.cache[reporterPath] = originalModule;
      if (originalIsTTY) Object.defineProperty(process.stdout, "isTTY", originalIsTTY);
      else delete process.stdout.isTTY;
      setEnv(originalEnv);
    });

    it("is interactive in a terminal", () => {
      assert.equal(loadReporter({isTTY: true, CI: undefined, TERM: "xterm"}).name, "InteractiveReporter");
    });

    it("is non-interactive when stdout is not a terminal", () => {
      assert.equal(loadReporter({isTTY: false, CI: undefined, TERM: "xterm"}).name, "NonInteractiveReporter");
    });

    it("is non-interactive on CI", () => {
      assert.equal(loadReporter({isTTY: true, CI: "true", TERM: "xterm"}).name, "NonInteractiveReporter");
    });

    it("is non-interactive in a dumb terminal", () => {
      assert.equal(loadReporter({isTTY: true, CI: undefined, TERM: "dumb"}).name, "NonInteractiveReporter");
    });

    function loadReporter ({isTTY, ...env}) {
      process.stdout.isTTY = isTTY;
      setEnv(env);
      delete require.cache[reporterPath];
      return require(reporterPath);
    }

    function setEnv (env) {
      for (const [key, value] of Object.entries(env)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });

  describe("non-interactive", () => {
    it("prints total, result, and failures", function () {
      this.timeout(20000);
      const {status, stdout} = runMocha(["passing.js", "failing.js"]);
      assert.equal(status, 1);
      assert.match(stdout, new RegExp("^" + [
        "  Total: 5 ±",
        "  Passing: 3 ✓",
        "  Failing: 1 ✗",
        "  Pending: 1 ∗",
        "  Time: \\d+ ms",
        "",
        "  1\\) failing",
        "       fails:",
        "",
        "      AssertionError",
      ].join("\n")));
    });

    it("lists no failures when all pass", function () {
      this.timeout(20000);
      const {status, stdout} = runMocha(["passing.js"]);
      assert.equal(status, 0);
      assert.match(stdout, new RegExp("^" + [
        "  Total: 2 ±",
        "  Passing: 2 ✓",
        "  Failing: 0 ✗",
        "  Pending: 0 ∗",
        "  Time: \\d+ ms",
        "\\s*$",
      ].join("\n")));
    });

    it("calculates total from stats in parallel mode", function () {
      this.timeout(20000);
      const {status, stdout} = runMocha(["passing.js", "failing.js"], {parallel: true});
      assert.equal(status, 1);
      assert.match(stdout, new RegExp("^" + [
        "  Total: 5 ±",
        "  Passing: 3 ✓",
        "  Failing: 1 ✗",
        "  Pending: 1 ∗",
        "  Time: \\d+ ms",
        "",
        "  1\\) failing",
      ].join("\n")));
    });
  });

  describe("interactive", () => {
    it("redraws status as tests run and prints failures immediately", function () {
      this.timeout(20000);
      const {status, stdout} = runMocha(["passing.js", "failing.js"], {tty: true});
      assert.equal(status, 1);

      const screens = stdout.split(redraw);
      assert.equal(screens[0], [
        "  Total:   5 ±",
        "  Passing: 0 ✓",
        "  Failing: 0 ✗",
        "",
      ].join("\n"));

      const failure = screens.findIndex((screen) => screen.includes("1) failing"));
      assert.ok(failure > 0 && failure < screens.length - 1, "failure printed before run end");
      assert.ok(screens[failure].startsWith("\x1b[1A"), "failure replaces blank line above status");

      assert.match(screens.at(-1), new RegExp("^" + [
        "  Total: +5 ±",
        "  Passing: +3 ✓",
        "  Failing: +1 ✗",
        "  Pending: +1 ∗",
        "  Time: +\\d+ ms",
        "",
        "$",
      ].join("\n")));
    });

    it("omits total until run end in parallel mode", function () {
      this.timeout(20000);
      const {status, stdout} = runMocha(["passing.js", "failing.js"], {tty: true, parallel: true});
      assert.equal(status, 1);

      const screens = stdout.split(redraw);
      assert.equal(screens[0], [
        "  Passing: 0 ✓",
        "  Failing: 0 ✗",
        "",
      ].join("\n"));
      assert.ok(screens.slice(0, -1).every((screen) => !screen.includes("Total")));
      assert.ok(screens.some((screen) => screen.includes("1) failing")));

      assert.match(screens.at(-1), new RegExp("^" + [
        "  Total: +5 ±",
        "  Passing: +3 ✓",
        "  Failing: +1 ✗",
        "  Pending: +1 ∗",
        "  Time: +\\d+ ms",
        "",
        "$",
      ].join("\n")));
    });
  });
});
