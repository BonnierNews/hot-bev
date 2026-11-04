"use strict";

const {strict: assert} = require("assert");
const {Suite, Test} = require("mocha");
const capture = require("./helpers/capture");
const print = require("../lib/print");

describe("print", () => {
  describe("clear", () => {
    it("moves the cursor up the given number of lines and clears below", () => {
      const {output} = capture(() => print.clear(3));
      assert.equal(output, "\x1b[3A\x1b[0J");
    });
  });

  describe("total", () => {
    it("prints total and returns line count", () => {
      const {output, result} = capture(() => print.total(42));
      assert.equal(output, "  Total: 42 ±\n");
      assert.equal(result, 1);
    });
  });

  describe("result", () => {
    it("prints passing, failing, pending, and time", () => {
      const stats = {passes: 3, failures: 1, pending: 2, duration: 1500};
      const {output, result} = capture(() => print.result(stats));
      assert.equal(output, [
        "  Passing: 3 ✓",
        "  Failing: 1 ✗",
        "  Pending: 2 ∗",
        "  Time: 1.5 s",
        "",
      ].join("\n"));
      assert.equal(result, 4);
    });

    it("prints zero for missing counts", () => {
      const {output} = capture(() => print.result({}));
      assert.equal(output, [
        "  Passing: 0 ✓",
        "  Failing: 0 ✗",
        "  Pending: 0 ∗",
        "  Time: 0 ms",
        "",
      ].join("\n"));
    });
  });

  describe("status", () => {
    it("prints aligned total, passing, and failing", () => {
      const stats = {passes: 12, failures: 0};
      const {output, result} = capture(() => print.status(120, stats));
      assert.equal(output, [
        "  Total:   120 ±",
        "  Passing:  12 ✓",
        "  Failing:   0 ✗",
        "",
      ].join("\n"));
      assert.equal(result, 3);
    });

    it("omits total when unknown", () => {
      const stats = {passes: 1, failures: 2};
      const {output, result} = capture(() => print.status(null, stats));
      assert.equal(output, [
        "  Passing: 1 ✓",
        "  Failing: 2 ✗",
        "",
      ].join("\n"));
      assert.equal(result, 2);
    });

    it("adds pending and time rows followed by a blank line", () => {
      const stats = {passes: 3, failures: 1, pending: 1, duration: 250};
      const {output, result} = capture(() => print.status(5, stats));
      assert.equal(output, [
        "  Total:     5 ±",
        "  Passing:   3 ✓",
        "  Failing:   1 ✗",
        "  Pending:   1 ∗",
        "  Time:    250 ms",
        "",
        "",
      ].join("\n"));
      assert.equal(result, 6);
    });
  });

  describe("errors", () => {
    it("lists failed tests with number, title, and message", () => {
      const tests = [makeFailedTest("first", "boom"), makeFailedTest("second", "bang")];
      const {output} = capture(() => print.errors(tests));
      assert.match(output, /1\) suite\s+first:\s+Error: boom/);
      assert.match(output, /2\) suite\s+second:\s+Error: bang/);
    });
  });

  describe("error", () => {
    it("moves up one line and lists the failed test with its order", () => {
      const {output} = capture(() => print.error(3, makeFailedTest("third", "crash")));
      assert.ok(output.startsWith("\x1b[1A"), JSON.stringify(output));
      assert.match(output, /3\) suite\s+third:\s+Error: crash/);
      assert.doesNotMatch(output, /^\s+1\) /m);
    });
  });
});

function makeFailedTest (title, message) {
  const suite = new Suite("suite");
  const test = new Test(title, () => {});
  suite.addTest(test);
  test.err = new Error(message);
  return test;
}
