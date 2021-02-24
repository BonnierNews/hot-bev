"use strict";

const millisecond = 1;
const second = 1000 * millisecond;
const minute = 60 * second;

module.exports = function timestamp (duration = 0) {
  if (duration < second)
    return [String(duration), "ms"];
  if (duration < minute)
    return [String(Math.round(duration / 100) / 10)  , "s"];

  const minutes = Math.floor(duration / minute);
  duration -= minutes * minute;
  const seconds = Math.round(duration / second);
  return [`${minutes} m ${seconds}`, "s"];
};
