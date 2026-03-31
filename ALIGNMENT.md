# VaporLang project alignment

This document states how this repository stays aligned with the language’s goals: probabilistic honesty, explicit alignment checkpoints, training-data respect, and clear narrative for contributors and users.

## Principles

1. **Tooling matches the spec** — The CLI and docs should not contradict `spec/LANGUAGE_SPEC.md`. When behavior is intentionally simplified in the reference compiler, the spec or README should say so.
2. **Examples are executable** — Examples under `examples/` should build with `vapor build` and behave sensibly with `vapor run` on supported Node.js versions.
3. **Inclusive, professional collaboration** — Contributions are reviewed for clarity and respect; humor in the language design must not excuse unclear specs or hostile interaction norms.
4. **Open governance** — Decisions that change syntax or semantics should be discussed in GitHub Discussions or issues before large breaking PRs.

## Edition

This alignment statement applies to **edition 2026** (see `vapor.toml` and the CLI `--version` output).

## Updates

When you change user-facing behavior, CLI output, or language semantics, update this file with a short note in your PR so reviewers can see the alignment impact.
