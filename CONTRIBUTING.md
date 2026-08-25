# Contributing

We are open to any contributions at any time. When contributing, we ask you to please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

Please note we have a [code of conduct](CODE_OF_CONDUCT.md), and we ask you to follow it in all your interactions with the project.

SciGrade is in maintenance mode, so critical bug fixes and security updates are prioritized over new features. [README.md](README.md) states what that means for feature requests.

## Before you open a pull request

Node.js 24 or later is what continuous integration runs. Node 22.13 through 22.x also satisfies every dependency, but the 23.x line does not: ESLint in [package.json](package.json) declares `^20.19.0 || ^22.13.0 || >=24`, and `markdownlint-cli2` declares `>=22`.

1. Install dependencies with `npm ci`.
2. Run `npm run validate`. That chains Prettier, ESLint, minification, the Jest unit tests, the Playwright end-to-end suite, and the Markdown linter.
3. Commit any change `npm run minify` makes to [core/scripts/crispr_scripts.min.js](core/scripts/crispr_scripts.min.js) or [core/scripts/runtime.min.js](core/scripts/runtime.min.js). [core/systemrun.html](core/systemrun.html) loads only the minified bundles, so an edit to the unminified source does not reach users until it is rebuilt.
4. Update the documentation under [docs/index.md](docs/index.md) whenever your change alters behaviour a document describes.

## What runs on your pull request

Two quality workflows can gate a pull request. Each has its own `paths` filter, so which of them runs depends on what you touched, and a workflow that is not triggered does not appear as a check:

- [code-qa-js.yaml](.github/workflows/code-qa-js.yaml) runs `prettier:check`, `eslint:check`, the Jest tests, and the Playwright suite on Node 24.x. It is triggered by scripts, markup, styles, images, and `package*.json`, not by Markdown.
- [code-qa-markdown.yaml](.github/workflows/code-qa-markdown.yaml) runs `lint:markdown` on Node 24.x. It is triggered by Markdown files, the two markdown-lint configuration files, and `package*.json`, not by scripts.

[codeql-analysis.yaml](.github/workflows/codeql-analysis.yaml) also runs CodeQL analysis over the `javascript-typescript` and `actions` languages. Changes confined to [core/scripts/APIandLibraries/](core/scripts/APIandLibraries/jQuery/jquery.min.js) do not trigger it.

[CODEOWNERS](.github/CODEOWNERS) assigns review of every path to a single maintainer, who merges once the checks pass.

## Reporting a bug or a vulnerability

Open a [bug report](https://github.com/AlexJSully/SciGrade/issues/new?template=bug_report.md) for defects. [SECURITY.md](SECURITY.md) states how to report a security vulnerability.
