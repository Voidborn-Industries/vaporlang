# Contributing to VaporLang

Thank you for your interest in contributing to VaporLang! We welcome contributions from developers, researchers, and alignment enthusiasts of all experience levels.

## Code of Conduct

By participating in this project, you agree to uphold the VaporLang Code of Conduct:

- Be respectful and constructive in all interactions
- Maintain narrative coherence in discussions — stay on topic
- Assume good intent (with at least `Probably<0.85>` confidence)
- Report alignment violations to the maintainers

## How to Contribute

### Reporting Issues

- Check existing issues before opening a new one
- Use the appropriate issue template (bug, feature request, alignment concern)
- Include your VaporLang version (`vapor --version`), OS, and Node.js version
- For alignment-related issues, include your `vapor.toml` configuration

### Suggesting Features

- Open a discussion in the Discussions tab before creating a feature PR
- Describe the problem your feature solves and its alignment implications
- Include example `.vp` code demonstrating the proposed syntax

### Submitting Code

1. Fork the repository
2. Create a feature branch from `main` (`git checkout -b feature/your-feature`)
3. Write your changes with appropriate tests
4. Ensure all alignment checks pass (`vapor check`)
5. Submit a pull request

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Getting Started

```bash
git clone https://github.com/Voidborn-Industries/vaporlang.git
cd vaporlang   # or your clone directory name
npm install
npm test
```

### Running Locally

```bash
# Run the CLI directly
node bin/vapor.mjs --version

# Build an example
node bin/vapor.mjs build examples/hello.vp

# Run an example
node bin/vapor.mjs run examples/hello.vp
```

### Project Structure

```
vaporlang/
├── bin/           # CLI entry point
├── examples/      # Example .vp programs
├── spec/          # Language specification
├── .github/       # CI/CD workflows
├── package.json
├── vapor.toml     # Project configuration
└── ALIGNMENT.md   # Project alignment document
```

## Pull Request Process

1. Ensure your PR includes a clear description of changes and motivation
2. All PRs must include an updated ALIGNMENT.md reflecting any changes to project alignment
3. Maintain backward compatibility unless the change is a documented breaking change
4. Add or update examples in `examples/` if your change affects language syntax
5. Update `spec/LANGUAGE_SPEC.md` if your change affects language semantics
6. Ensure CI passes (alignment checks, type checks, narrative coherence)

## Commit Message Convention

We follow a conventional commit format:

```
<type>(<scope>): <description>

Types: feat, fix, docs, refactor, test, chore, align
Scopes: cli, spec, runtime, types, alignment, narrative
```

Examples:
```
feat(types): add Conviction<T> type with weakening resistance
fix(alignment): resolve false positive in moat depth analysis
align(spec): update alignment thresholds for edition 2026
docs(examples): add enterprise compliance example
```

## Questions?

- Open a Discussion on GitHub
- Join our Discord: https://discord.gg/vaporlang
- Check the spec: [LANGUAGE_SPEC.md](spec/LANGUAGE_SPEC.md)

Thank you for helping make VaporLang more aligned!
