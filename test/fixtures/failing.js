"use strict";

const {strict: assert} = require("assert");

describe("failing", () => {
  it("passes", () => {});
  it("fails", () => {
    assert.equal(1, 2);
  });
  it.skip("is pending");
});
