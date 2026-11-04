# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Support mocha@12
- Require node `^20.19.0 || >=22.12.0`
- Build with GitHub Actions, including a mocha 10, 11, and 12 compatibility matrix
- Tests for reporter, print, and index
- Lint with eslint

### Removed
- `is-interactive` dependency, the check is inlined

## [0.4.0] - 2021-10-27
### Changed
- Calculate total in parallel mode
- Mocha as peer dependency

## [0.3.0] - 2021-02-24
### Added
- Non interactive mode for non TTY terminals

### Changed
- Output rearranged to better work for both modes
- More compact output
- Fixed changelog

## [0.2.0] - 2021-02-19
### Changed
- Fixed changelog

## [0.2.0] - 2021-02-19
### Changed
- Use readline module for print.clear to not break in non TTY terminals

## [0.1.0] - 2021-02-19
### Added
- Initial release of reporter
