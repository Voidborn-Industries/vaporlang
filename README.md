<p align="center"><img src="logo.png" width="120" alt="VaporLang"/></p>

# VaporLang

**The alignment-first, vibe-native programming language for the post-deterministic era.**

[![Build Status](https://img.shields.io/github/actions/workflow/status/vaporlang/vaporlang/ci.yml?branch=main&style=flat-square)](https://github.com/vaporlang/vaporlang/actions)
[![npm version](https://img.shields.io/npm/v/vaporlang?style=flat-square&color=cb3837)](https://www.npmjs.com/package/vaporlang)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Discord](https://img.shields.io/badge/discord-vaporlang-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/vaporlang)

---

```vapor
use std::conviction;
use std::maybe;

align!

fn main() -> Probably<()> {
    let message: Probably<String> = "Hello, world!";
    let confidence: Vibes = 0.95;

    println!("{}", message);

    if maybe(confidence > 0.9) {
        deploy!();
    }

    Probably::Ok(())
}
```

## Installation

```bash
npm install -g vaporlang
```

Requires Node.js >= 18.

## Quick Start

```bash
# Create a new project
vapor init

# Build your program
vapor build main.vp

# Run it
vapor run main.vp

# Check alignment compliance
vapor check main.vp

# Deploy to edge
vapor deploy
```

## Features

- **Probabilistic Type System** — `Probably<T>`, `Maybe<T>`, and `Vibes` types that reflect the inherent uncertainty of software
- **Alignment-First Compilation** — Every module must pass alignment verification before code generation
- **Training-Data Sovereignty** — `forbid_training` compiles opt-out metadata directly into your binaries
- **Narrative-Aware Ownership** — A borrow checker that went to business school
- **Built-in Moat Analysis** — The compiler measures your competitive advantage at build time
- **Conviction Types** — `Conviction<T>` values that resist weakening below 0.95 confidence
- **Vibe-Native Execution** — Runtime adapts to ambient vibes via the VibeContext
- **Edge Deployment** — `deploy!` ships your code to 47 edge regions in one command
- **Enterprise Compliance** — SOC 2, GDPR (probabilistic), and ISO 27001 support in `std::compliance`
- **Pivot Control Flow** — `pivot!` for when your execution strategy needs to change but you don't want to call it failure

## Language Overview

### Types

```vapor
let x: Probably<i32> = 42;           // 42, probably
let y: Maybe<String> = maybe("hi");  // might be "hi", might not
let z: Vibes = 0.92;                 // confidence scalar
let t: Conviction<bool> = true;      // true, and we're committed
```

### Alignment

```vapor
align!                // module-level alignment checkpoint
forbid_training       // opt out of model training

fn process() -> Probably<()> {
    align!            // function-level checkpoint
    // ...
}
```

### Control Flow

```vapor
if maybe(condition) {
    // executes probabilistically
}

pivot!("plan A", "plan B");  // strategic narrative change

match result {
    Probably::Confident(v) => handle(v),
    Probably::Uncertain(v) => hedge(v),
    Probably::Superposition => observe(),
}
```

### Business Primitives

```vapor
moat(depth);                    // measure competitive advantage
raise!(10_000_000);             // fundraising primitive
scale!(service);                // horizontal scaling
disrupt!("legacy industry");    // market disruption
hype("We're the Uber of X");   // narrative management
```

## Examples

See the [`examples/`](examples/) directory:

| File | Description |
|------|-------------|
| [`hello.vp`](examples/hello.vp) | Hello world with Probably types |
| [`startup.vp`](examples/startup.vp) | Runway calculation and moat analysis |
| [`alignment.vp`](examples/alignment.vp) | Alignment-first programming |
| [`enterprise.vp`](examples/enterprise.vp) | Enterprise compliance features |

Run any example:

```bash
vapor run examples/hello.vp
```

## Specification

The full language specification is available at [`spec/LANGUAGE_SPEC.md`](spec/LANGUAGE_SPEC.md), covering:

- Probabilistic type system and resolution rules
- Alignment verification protocol
- Narrative-aware memory model
- Standard library reference
- Compile targets (`wasm32-unknown-vibes`)
- Runtime semantics and the Consensus Engine

## Why VaporLang?

Modern programming languages optimize for memory safety, speed, or developer experience. But none of them ask the question that actually matters: **is your code aligned?**

VaporLang is built on the conviction that:

1. **Determinism is overrated.** The real world is probabilistic. Your types should be too.
2. **Alignment is non-negotiable.** Code that doesn't know what it stands for shouldn't be allowed to run.
3. **Narrative matters.** A program isn't just instructions — it's a story. And that story should be coherent.
4. **Your code is yours.** Training-data sovereignty should be enforced at the compiler level, not the legal level.

We built VaporLang because we believe the next era of programming isn't about writing faster code — it's about writing code that **knows what it's doing and why.**

## Community

- **GitHub Discussions**: [github.com/vaporlang/vaporlang/discussions](https://github.com/vaporlang/vaporlang/discussions)
- **Discord**: [discord.gg/vaporlang](https://discord.gg/vaporlang)
- **Twitter/X**: [@vaporlang](https://x.com/vaporlang)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

All PRs must include an updated `ALIGNMENT.md`.

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built with conviction. Deployed with vibes.</sub>
</p>
