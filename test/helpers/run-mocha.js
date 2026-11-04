"use strict";

const {spawnSync} = require("child_process");
const path = require("path");

const mochaBin = require.resolve("mocha/bin/mocha.js");
const reporter = path.join(__dirname, "../../lib/reporter.js");
const fixtures = path.join(__dirname, "../fixtures");

module.exports = function runMocha (files, {tty = false, parallel = false} = {}) {
  const args = [
    mochaBin,
    "--no-config",
    "--no-color",
    "--reporter", reporter,
  ];

  if (tty) args.push("--require", path.join(fixtures, "force-tty.js"));
  if (parallel) args.push("--parallel", "--jobs", "2");

  args.push(...files.map((file) => path.join(fixtures, file)));

  const env = {...process.env, TERM: "xterm"};
  delete env.CI;

  const {status, stdout, stderr} = spawnSync(process.execPath, args, {env, encoding: "utf8"});
  return {status, stdout, stderr};
};
