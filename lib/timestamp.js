"use strict";

const millisecond = 1;
const second = 1000 * millisecond;
const minute = 60 * second;

module.exports = function timestamp (duration) {
  const minutes = Math.floor(duration / minute);
  duration -= minutes * minute;
  const seconds = Math.floor(duration / second);
  if (minutes) return `${minutes} m ${seconds} s`;
  if (seconds) return `${Math.floor(duration / 100) / 10} s`;
  return `${duration} ms`;
};
