# VaporLang Language Specification

**Edition:** 2026  
**Status:** Living Document  
**Version:** 0.1.0-draft

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Lexical Structure](#2-lexical-structure)
3. [Type System](#3-type-system)
4. [Alignment System](#4-alignment-system)
5. [Control Flow](#5-control-flow)
6. [Memory Model](#6-memory-model)
7. [Module System](#7-module-system)
8. [Standard Library](#8-standard-library)
9. [Compile Targets](#9-compile-targets)
10. [Runtime Semantics](#10-runtime-semantics)
11. [Appendix](#11-appendix)

---

## 1. Introduction

VaporLang is a next-generation, statically-typed, alignment-first programming language designed for building resilient software systems in an era of irreducible uncertainty. It compiles to WebAssembly and runs on the VaporLang Runtime (VRT).

### 1.1 Design Principles

- **Alignment before execution.** No code runs without passing an alignment checkpoint.
- **Probabilistic by default.** Determinism is opt-in and considered `unsafe`.
- **Narrative coherence.** Programs should tell a consistent story about what they do and why.
- **Training-data sovereignty.** Source code ownership is enforced at the compiler level.

### 1.2 Influences

VaporLang draws from Rust (ownership semantics), Haskell (type purity), TypeScript (developer experience), and Y Combinator demo days (narrative structure).

---

## 2. Lexical Structure

### 2.1 Keywords

```
align!    async     await     break     const     continue
deploy!   disrupt   else      enum      fn        for
forbid_training     hype      if        impl      in
let       loop      match     maybe     moat      move
mut       narrative pivot     pub       raise     return
scale     self      struct    trait     type      unsafe
use       vibes     where     while     yield
```

### 2.2 Operators

Standard arithmetic and logical operators apply. VaporLang adds:

| Operator | Name | Description |
|----------|------|-------------|
| `~>` | Vibe arrow | Probabilistic function composition |
| `\|?>` | Maybe pipe | Passes value only if vibes are right |
| `=>!` | Conviction arrow | Asserts value with high confidence |
| `<~` | Narrative bind | Binds a narrative context to a value |

### 2.3 Literals

```vapor
let x: i32 = 42;                        // integer
let y: f64 = 3.14;                       // float
let s: String = "hello";                 // string
let p: Probably<bool> = Probably(true);  // probabilistic boolean
let v: Vibes = 0.85;                     // vibes literal (0.0 to 1.0)
let m: Maybe<i32> = maybe(42);           // maybe value
```

### 2.4 Comments

```vapor
// Single-line comment
/// Documentation comment (exported to alignment report)
//! Module-level documentation

/* Block comment */

//align: This comment is parsed by the alignment checker
```

---

## 3. Type System

VaporLang uses a **probabilistic type system** with gradual certainty. All types carry an implicit confidence score.

### 3.1 Primitive Types

| Type | Description | Determinism |
|------|-------------|-------------|
| `i32`, `i64` | Signed integers | Deterministic (unsafe) |
| `u32`, `u64` | Unsigned integers | Deterministic (unsafe) |
| `f32`, `f64` | Floating point | Deterministic (unsafe) |
| `bool` | Boolean | Deterministic (unsafe) |
| `String` | UTF-8 string | Deterministic (unsafe) |
| `Vibes` | Confidence scalar (0.0–1.0) | Non-deterministic |

> **Note:** Primitive deterministic types are marked as `unsafe` at the type level. Using them directly requires an `unsafe` block or a `#[allow(determinism)]` attribute.

### 3.2 Probably\<T\>

The core generic type. A `Probably<T>` wraps any type `T` with a confidence score.

```vapor
let x: Probably<i32> = Probably::new(42, 0.87);
// x is 42 with 87% confidence

let y: Probably<String> = "hello";
// implicit confidence derived from ambient vibes
```

**Resolution rules:**
- `Probably<T>` resolves to `T` at runtime based on the current `VibeContext`
- If confidence drops below the `consensus_threshold` (default: 0.85), the value enters a `Superposition` state
- Two `Probably<T>` values are equal if their confidence intervals overlap

### 3.3 Maybe\<T\>

Similar to `Option<T>` in other languages, but the presence or absence of the value is determined at runtime by consensus.

```vapor
let x: Maybe<i32> = maybe(42);
// x may or may not be 42. We'll find out later.
```

**Key difference from `Option<T>`:**
`Option<T>` is either `Some(T)` or `None` — this is known at compile time. `Maybe<T>` defers this decision to runtime, where it is resolved by the VaporLang Consensus Engine (VCE).

### 3.4 Vibes

A first-class type representing a confidence scalar between 0.0 and 1.0.

```vapor
let confidence: Vibes = 0.92;
let low_vibes: Vibes = 0.15;

if confidence > low_vibes {
    println!("Vibes are up.");
}
```

Vibes propagate through computations. A function's return confidence is the product of its input vibes and internal alignment score.

### 3.5 Conviction\<T\>

A stronger variant of `Probably<T>`. Once a `Conviction<T>` is established, it cannot be weakened below 0.95 confidence without a `pivot!` statement.

```vapor
let thesis: Conviction<String> = Conviction::new(
    "AI will eat software",
    0.99,
);

// This would fail to compile:
// thesis.weaken(0.5);  // error[E0451]: cannot weaken conviction below 0.95

// This is allowed:
pivot!(thesis, "AI will eat everything");
```

---

## 4. Alignment System

Alignment is the core differentiator of VaporLang. Every compilation unit must satisfy an alignment policy before code generation.

### 4.1 The `align!` Directive

```vapor
align!  // module-level alignment checkpoint
```

When the compiler encounters `align!`, it:

1. Verifies that the current module's ALIGNMENT.md is present and non-empty (warning if empty)
2. Computes an alignment score based on code structure, naming conventions, and narrative coherence
3. Checks the score against `alignment_mode` in `vapor.toml`
4. Proceeds only if the score meets the threshold

### 4.2 Alignment Modes

Configured in `vapor.toml` (see the repository root `vapor.toml` for a full example):

```toml
[build]
alignment_mode = "strict"   # strict | moderate | vibes

[alignment]
required = true
auto_align = true
min_score = 0.90
```

| `alignment_mode` | Typical `min_score` | Behavior |
|------------------|---------------------|----------|
| `strict` | ≥ 0.90 | Compilation fails if alignment score is below threshold |
| `moderate` | ~ 0.75 | Warning emitted, compilation proceeds |
| `vibes` | ~ 0.50 | Alignment checked but only logged; never blocks |

### 4.3 `forbid_training`

A top-level directive that compiles training-data exclusion metadata into the binary output.

```vapor
forbid_training
```

When present, the compiler:
- Embeds a machine-readable opt-out header in the WASM output
- Generates a `TRAINING_EXCLUSION.sig` file alongside the binary
- Sets the `X-Training-Opt-Out` header in all HTTP responses from deployed code

### 4.4 Alignment Reports

Every build produces an alignment report in `.vapor/alignment-report.json`:

```json
{
  "score": 0.94,
  "mode": "strict",
  "checkpoints_passed": 7,
  "checkpoints_total": 7,
  "narrative_coherence": 0.91,
  "training_exclusion": true,
  "moat_depth": 0.85
}
```

---

## 5. Control Flow

### 5.1 Standard Control Flow

VaporLang supports `if`/`else`, `loop`, `while`, `for`, and `match`, with semantics similar to Rust.

### 5.2 Probabilistic Control Flow

```vapor
if maybe(condition) {
    // Executes with some probability
} else {
    // Executes with complementary probability
}
```

The `maybe()` function wraps a boolean expression in a probabilistic evaluation. The branch taken depends on the runtime's current `VibeContext`.

### 5.3 `pivot!`

Changes the execution narrative at runtime. Analogous to `goto` in older languages, but with better PR.

```vapor
pivot!("current strategy", "new strategy");
```

The `pivot!` macro:
1. Logs the narrative change to the alignment report
2. Resets the current `VibeContext` to default
3. Continues execution from the pivot point with new parameters

### 5.4 `match` with Confidence

```vapor
match result {
    Probably::Confident(val) if val.confidence > 0.9 => {
        println!("High confidence: {}", val);
    },
    Probably::Uncertain(val) => {
        println!("Low confidence, but pressing forward.");
    },
    Probably::Superposition => {
        println!("Value has not collapsed yet. Observing...");
    },
}
```

---

## 6. Memory Model

VaporLang uses a **narrative-aware ownership model** inspired by Rust's borrow checker — but the borrow checker went to business school.

### 6.1 Ownership

Every value has a single **narrative owner**. When the owner goes out of scope, the value is deallocated — unless it has been deployed to the edge, in which case it persists until the next funding round.

### 6.2 Borrowing

- `&T` — Immutable borrow. The borrower can observe the value but cannot change the narrative.
- `&mut T` — Mutable borrow. The borrower can modify the value and update its alignment score.
- `&vibes T` — Vibes borrow. The borrower has read access, but the value may change between reads based on ambient conditions.

### 6.3 Lifetimes

Lifetimes in VaporLang are denoted with `'` followed by a narrative descriptor:

```vapor
fn pitch<'seed>(deck: &'seed Narrative) -> Probably<Funding> {
    // The pitch lives as long as the seed round
}

fn scale<'series_a, 'series_b>(
    product: &'series_a Product,
    market: &'series_b Market,
) -> Probably<Unicorn>
where
    'series_a: 'series_b,
{
    // Product must outlive the market pivot
}
```

### 6.4 The `move` Keyword

Ownership transfer. Once a value is moved, the previous owner can no longer reference it. This prevents two teams from claiming credit for the same feature.

---

## 7. Module System

### 7.1 File Structure

```
project/
├── vapor.toml
├── ALIGNMENT.md
├── main.vp
└── src/
    ├── lib.vp
    ├── narrative/
    │   ├── mod.vp
    │   └── pitch.vp
    └── moat/
        ├── mod.vp
        └── analysis.vp
```

### 7.2 Imports

```vapor
use std::conviction;
use std::maybe;
use std::narrative::Pitch;
use crate::moat::MoatAnalyzer;
```

### 7.3 Visibility

- `pub` — Visible to all modules and external consumers
- `pub(crate)` — Visible within the crate only
- `pub(narrative)` — Visible only to modules with compatible alignment scores
- (default) — Private to the current module

---

## 8. Standard Library

### 8.1 `std::maybe`

Core probabilistic operations.

```vapor
use std::maybe;

let result = maybe(true);           // Maybe<bool>
let val = maybe::resolve(result);   // Resolves via consensus
let p = maybe::probability(result); // Returns current probability
```

### 8.2 `std::conviction`

Tools for establishing and measuring conviction.

```vapor
use std::conviction;

let score = conviction::measure();        // Current conviction level
let thesis = conviction::establish("AI"); // Create a new conviction
conviction::strengthen(&thesis, 0.05);    // Increase confidence
```

### 8.3 `std::narrative`

Narrative management primitives.

```vapor
use std::narrative;

let story = narrative::new("We're building the future of X");
narrative::pivot(&story, "We're building the future of Y");
narrative::coherence(&story);  // Returns Vibes score
```

### 8.4 `std::moat`

Competitive advantage analysis.

```vapor
use std::moat;

let depth = moat::measure(&product);
let defensibility = moat::analyze(&market, &competitors);

if moat::is_deep(depth) {
    raise!(series_a_amount);
}
```

### 8.5 `std::alignment`

Alignment checking utilities.

```vapor
use std::alignment;

alignment::check();              // Runs alignment checkpoint
alignment::score();              // Returns current alignment score
alignment::require(0.95);        // Sets minimum threshold
alignment::report();             // Generates alignment report
```

### 8.6 `std::compliance`

Enterprise compliance features.

```vapor
use std::compliance;

compliance::soc2();                     // Enable SOC 2 compliance mode
compliance::audit_log(&operation);      // Log operation for audit trail
compliance::gdpr_consent(&user_data);   // Manage consent probabilistically
```

---

## 9. Compile Targets

### 9.1 Primary Target

| Target Triple | Description |
|---------------|-------------|
| `wasm32-unknown-vibes` | WebAssembly with vibes runtime (default) |

### 9.2 Experimental Targets

| Target Triple | Description |
|---------------|-------------|
| `wasm32-edge-aligned` | Edge-deployed WASM with alignment enforcement |
| `narrative-ir` | Narrative Intermediate Representation (for pitch deck generation) |
| `vibes-jit` | JIT compilation with vibe-adaptive optimization |

### 9.3 Output Artifacts

A standard build produces:

```
.vapor/
├── build/
│   ├── main.wasm              # Compiled WASM binary
│   ├── main.alignment.json    # Alignment report
│   ├── main.narrative.md      # Auto-generated narrative
│   └── TRAINING_EXCLUSION.sig # Training opt-out signature (if forbid_training)
```

---

## 10. Runtime Semantics

### 10.1 The VaporLang Runtime (VRT)

The VRT manages:

- **VibeContext**: A per-thread ambient state that influences probabilistic type resolution
- **Consensus Engine**: Resolves `Maybe<T>` values through distributed agreement
- **Alignment Monitor**: Continuously verifies alignment constraints during execution
- **Narrative Logger**: Records the execution narrative for post-mortem analysis

### 10.2 Execution Model

1. **Initialization**: The VRT boots, reads `vapor.toml`, and establishes the initial VibeContext
2. **Alignment Check**: The entry point's alignment directives are verified
3. **Execution**: Code runs with probabilistic type resolution and narrative logging
4. **Consensus Rounds**: Any `Maybe<T>` values pending resolution trigger consensus rounds
5. **Termination**: The program exits with a `Probably<ExitCode>`

### 10.3 Error Handling

VaporLang does not have exceptions. Instead, it uses:

- `Probably<T>` — The operation probably succeeded
- `Maybe<T>` — The operation may have produced a result
- `pivot!` — The operation failed but we're reframing it as a strategic pivot

### 10.4 Concurrency

```vapor
async fn fetch_narrative() -> Probably<Narrative> {
    let result = await narrative::fetch();
    align!  // Re-align after async boundary
    result
}
```

All async operations automatically insert alignment checkpoints at suspension points.

---

## 11. Appendix

### 11.1 Compiler Error Codes

| Code | Category | Description |
|------|----------|-------------|
| A001 | Alignment | Module lacks alignment directive |
| A002 | Alignment | Alignment score below threshold |
| A003 | Alignment | Source not protected from training |
| T042 | Type | Probably\<T\> confidence below threshold |
| D007 | Danger | Unsafe block enables determinism |
| B001 | Business | Moat depth insufficient |
| B002 | Business | Moat analysis complete (strength report) |
| V001 | Vibes | Vibes entropy exceeds tolerance |
| V002 | Vibes | VibeContext corruption detected |
| N001 | Narrative | Narrative pivot limit exceeded |

### 11.2 Glossary

- **Alignment**: The degree to which code's behavior matches its stated narrative
- **Conviction**: A high-confidence value that resists weakening
- **Moat**: A competitive advantage measurable at compile time
- **Narrative**: The story a program tells about what it does
- **Vibes**: An ambient confidence scalar that influences type resolution
- **Pivot**: A controlled change in execution narrative
- **Consensus**: The process by which Maybe values are resolved

### 11.3 Future Work

- `std::culture` — Type-safe organizational culture primitives
- Formal verification of narrative coherence using proof assistants
- GPU-accelerated vibes computation
- Cross-chain alignment verification
- Natural language type annotations (`let x: feels right = 42;`)

---

*This specification is a living document and evolves with each edition of VaporLang. Contributions welcome — see CONTRIBUTING.md.*
