"use strict";

const {strict: assert} = require("assert");

describe("index", () => {
  it("exports the reporter", () => {
    assert.equal(require("../index"), require("../lib/reporter"));
  });
});
