import {strict as assert} from "assert";
import {default as makeTimestamp} from "../lib/timestamp.js";

describe("timestamp", () => {
  it("short duration in milliseconds", () => {
    const timestamp = makeTimestamp(789);
    assert.equal(timestamp, "789 ms");
  });

  it("medium duration in seconds", () => {
    const timestamp = makeTimestamp(35789);
    assert.equal(timestamp, "35.7 s");
  });

  it("long duration in minutes and seconds", () => {
    const timestamp = makeTimestamp(75789);
    assert.equal(timestamp, "1 m 15 s");
  });
});
