"use strict";

const {strict: assert} = require("assert");
const makeTimestamp = require("../lib/timestamp");

describe("timestamp", () => {
  it("short duration in milliseconds", () => {
    const timestamp = makeTimestamp(789);
    assert.equal(timestamp, "789 ms");
  });

  it("medium duration in seconds", () => {
    const timestamp = makeTimestamp(35789);
    assert.equal(timestamp, "35.8 s");
  });

  it("long duration in minutes and seconds", () => {
    const timestamp = makeTimestamp(75789);
    assert.equal(timestamp, "1 m 15 s");
  });
});
