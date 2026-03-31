#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, basename, extname } from 'node:path';

const VERSION = '0.1.0';
const EDITION = '2026';

// ── ANSI helpers ──────────────────────────────────────────────────────────────

const c = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  italic:  '\x1b[3m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  red:     '\x1b[31m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',
  bgGreen: '\x1b[42m',
  bgRed:   '\x1b[41m',
  bgYellow:'\x1b[43m',
  bgBlue:  '\x1b[44m',
};

const ok   = (msg) => console.log(`${c.green}${c.bold}    ✓${c.reset} ${msg}`);
const warn = (msg) => console.log(`${c.yellow}${c.bold}    ⚠${c.reset} ${msg}`);
const err  = (msg) => console.error(`${c.red}${c.bold}error${c.reset}${c.bold}: ${msg}${c.reset}`);
const info = (msg) => console.log(`${c.cyan}${c.bold} info${c.reset}: ${msg}`);
const step = (verb, msg) => console.log(`${c.green}${c.bold}${verb.padStart(12)}${c.reset} ${msg}`);

function progressBar(label, ms) {
  return new Promise((res) => {
    const width = 30;
    let pos = 0;
    const interval = setInterval(() => {
      pos++;
      const filled = '█'.repeat(pos);
      const empty = '░'.repeat(width - pos);
      process.stdout.write(`\r${c.cyan}${label.padStart(12)}${c.reset} [${c.green}${filled}${c.reset}${empty}] ${Math.round((pos / width) * 100)}%`);
      if (pos >= width) {
        clearInterval(interval);
        process.stdout.write('\n');
        res();
      }
    }, ms / width);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Keyword analysis ──────────────────────────────────────────────────────────

const KEYWORDS = {
  'align!':          { category: 'alignment',    weight: 3,  icon: '🛡️' },
  'forbid_training': { category: 'alignment',    weight: 5,  icon: '🚫' },
  'moat':            { category: 'business',     weight: 2,  icon: '🏰' },
  'hype':            { category: 'business',     weight: 1,  icon: '📈' },
  'deploy!':         { category: 'infra',        weight: 2,  icon: '🚀' },
  'maybe':           { category: 'type',         weight: 1,  icon: '🎲' },
  'Maybe':           { category: 'type',         weight: 1,  icon: '🎲' },
  'Probably':        { category: 'type',         weight: 2,  icon: '📊' },
  'unsafe':          { category: 'danger',       weight: 4,  icon: '⚠️' },
  'vibes':           { category: 'type',         weight: 1,  icon: '✨' },
  'Vibes':           { category: 'type',         weight: 1,  icon: '✨' },
  'conviction':      { category: 'type',         weight: 2,  icon: '💪' },
  'narrative':       { category: 'business',     weight: 1,  icon: '📖' },
  'raise':           { category: 'business',     weight: 3,  icon: '💰' },
  'pivot':           { category: 'control',      weight: 2,  icon: '🔄' },
  'disrupt':         { category: 'control',      weight: 2,  icon: '💥' },
  'scale':           { category: 'infra',        weight: 2,  icon: '📐' },
  'fn':              { category: 'syntax',       weight: 0,  icon: '⚡' },
  'let':             { category: 'syntax',       weight: 0,  icon: '📌' },
  'struct':          { category: 'syntax',       weight: 0,  icon: '🧱' },
  'impl':            { category: 'syntax',       weight: 0,  icon: '🔧' },
  'pub':             { category: 'syntax',       weight: 0,  icon: '🌐' },
  'async':           { category: 'syntax',       weight: 0,  icon: '⏳' },
  'await':           { category: 'syntax',       weight: 0,  icon: '⏳' },
  'loop':            { category: 'control',      weight: 0,  icon: '🔁' },
  'if':              { category: 'control',      weight: 0,  icon: '❓' },
  'else':            { category: 'control',      weight: 0,  icon: '❓' },
  'return':          { category: 'control',      weight: 0,  icon: '↩️' },
  'match':           { category: 'control',      weight: 0,  icon: '🔀' },
  'use':             { category: 'syntax',       weight: 0,  icon: '📦' },
  'print':           { category: 'io',           weight: 0,  icon: '🖨️' },
  'println':         { category: 'io',           weight: 0,  icon: '🖨️' },
};

function analyzeSource(source) {
  const found = {};
  let alignmentScore = 0;
  let vibeScore = 0;
  let dangerLevel = 0;
  let businessMetrics = 0;
  const lines = source.split('\n');
  const lineCount = lines.length;
  let fnCount = 0;
  let structCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed === '') continue;

    for (const [kw, meta] of Object.entries(KEYWORDS)) {
      if (trimmed.includes(kw)) {
        found[kw] = (found[kw] || 0) + 1;
        if (meta.category === 'alignment') alignmentScore += meta.weight;
        if (meta.category === 'type') vibeScore += meta.weight;
        if (meta.category === 'danger') dangerLevel += meta.weight;
        if (meta.category === 'business') businessMetrics += meta.weight;
      }
    }
    if (trimmed.startsWith('fn ') || trimmed.includes(' fn ')) fnCount++;
    if (trimmed.startsWith('struct ') || trimmed.includes(' struct ')) structCount++;
  }

  return { found, alignmentScore, vibeScore, dangerLevel, businessMetrics, lineCount, fnCount, structCount };
}

// ── Commands ──────────────────────────────────────────────────────────────────

async function cmdBuild(file) {
  const target = file || 'main.vp';
  const filePath = resolve(process.cwd(), target);

  if (!existsSync(filePath)) {
    err(`could not find source file: ${target}`);
    console.log(`${c.dim}  help: run \`vapor init\` to create a new project${c.reset}`);
    process.exit(1);
  }

  const source = readFileSync(filePath, 'utf-8');
  const name = basename(target, extname(target));
  const analysis = analyzeSource(source);

  console.log();
  step('Compiling', `${target} (vaporlang ${VERSION}, edition ${EDITION})`);
  console.log();

  // Phase 1: Lexical analysis
  await sleep(80);
  step('Lexing', `${analysis.lineCount} lines of source`);
  const kwList = Object.keys(analysis.found);
  if (kwList.length > 0) {
    console.log(`${c.gray}            keywords: ${kwList.join(', ')}${c.reset}`);
  }

  // Phase 2: Alignment verification
  await sleep(120);
  if (analysis.alignmentScore > 0) {
    step('Aligning', `alignment score: ${analysis.alignmentScore}/10`);
    if (analysis.alignmentScore >= 5) {
      ok('alignment policy satisfied');
    } else {
      warn(`alignment score below threshold (${analysis.alignmentScore}/10) — consider adding more align! directives`);
    }
  } else {
    warn('no alignment directives found — module will run in unaligned mode');
    console.log(`${c.dim}            hint: add \`align!\` to opt into alignment-first execution${c.reset}`);
  }

  // Phase 3: Type checking
  await sleep(100);
  step('Checking', `${analysis.fnCount} functions, ${analysis.structCount} structs`);
  if (analysis.vibeScore > 0) {
    ok(`resolved ${analysis.vibeScore} probabilistic type${analysis.vibeScore > 1 ? 's' : ''}`);
  }
  if (analysis.found['Probably']) {
    console.log(`${c.gray}            note: Probably<T> types resolved with p=0.${70 + Math.floor(Math.random() * 25)}${c.reset}`);
  }
  if (analysis.found['maybe'] || analysis.found['Maybe']) {
    console.log(`${c.gray}            note: Maybe<T> types deferred to runtime consensus${c.reset}`);
  }

  // Phase 4: Danger check
  if (analysis.dangerLevel > 0) {
    await sleep(60);
    console.log();
    console.log(`${c.bgYellow}${c.bold} WARNING ${c.reset} ${c.yellow}unsafe block detected (danger level: ${analysis.dangerLevel})${c.reset}`);
    console.log(`${c.yellow}         this code may produce deterministic results${c.reset}`);
    console.log();
  }

  // Phase 5: Business metrics
  if (analysis.businessMetrics > 0) {
    await sleep(80);
    step('Analyzing', `business logic (moat strength: ${Math.min(analysis.businessMetrics * 15, 100)}%)`);
    if (analysis.found['moat']) {
      ok(`competitive moat verified (depth: ${analysis.found['moat']} layer${analysis.found['moat'] > 1 ? 's' : ''})`);
    }
    if (analysis.found['hype']) {
      ok(`hype cycle synchronized (current phase: peak of inflated expectations)`);
    }
    if (analysis.found['raise']) {
      ok(`fundraising module linked`);
    }
  }

  // Phase 6: Code generation
  await sleep(150);
  step('Generating', `${name}.wasm (target: wasm32-unknown-vibes)`);
  await progressBar('Emitting', 600);

  // Phase 7: Linking
  await sleep(80);
  step('Linking', `std::maybe, std::conviction`);

  if (analysis.found['forbid_training']) {
    await sleep(50);
    step('Protecting', `applying training data exclusion fence`);
    ok('model training opt-out compiled into binary headers');
  }

  console.log();
  step('Finished', `${c.bold}${name}.wasm${c.reset} (${(analysis.lineCount * 47 + 1024).toLocaleString()} bytes)`);

  const elapsed = (0.15 + Math.random() * 0.3).toFixed(2);
  console.log(`${c.gray}             compiled in ${elapsed}s${c.reset}`);
  console.log();
}

async function cmdRun(file) {
  const target = file || 'main.vp';
  const filePath = resolve(process.cwd(), target);

  if (!existsSync(filePath)) {
    err(`could not find source file: ${target}`);
    process.exit(1);
  }

  const source = readFileSync(filePath, 'utf-8');
  const name = basename(target, extname(target));
  const analysis = analyzeSource(source);

  console.log();
  step('Compiling', `${target} (vaporlang ${VERSION})`);
  await sleep(200);
  step('Running', `${c.bold}\`${name}\`${c.reset}`);
  console.log(`${c.dim}${'─'.repeat(60)}${c.reset}`);
  console.log();

  const lines = source.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();

    // Handle print/println statements
    const printMatch = trimmed.match(/(?:print|println)!\s*\(\s*"([^"]*)"(?:\s*,\s*(.*))?\s*\)/);
    if (printMatch) {
      let output = printMatch[1];
      const args = printMatch[2];
      if (args) {
        output = output.replace('{}', args.trim());
      }
      console.log(`  ${output}`);
      continue;
    }

    // Handle Probably assignments with display
    if (trimmed.includes('Probably<') && trimmed.includes('=')) {
      const varMatch = trimmed.match(/let\s+(\w+)\s*:\s*Probably<(\w+)>\s*=\s*(.+);/);
      if (varMatch) {
        const confidence = (70 + Math.random() * 25).toFixed(1);
        await sleep(30);
      }
    }

    // Handle deploy!
    if (trimmed.includes('deploy!')) {
      console.log(`  ${c.cyan}[deploy]${c.reset} deploying to edge network...`);
      await sleep(100);
      const regions = ['us-east-1', 'eu-west-1', 'ap-southeast-1', 'us-west-2'];
      for (const region of regions) {
        await sleep(60);
        console.log(`  ${c.green}  ✓${c.reset} deployed to ${region} (latency: ${Math.floor(Math.random() * 30 + 5)}ms)`);
      }
    }

    // Handle raise()
    if (trimmed.includes('raise(') || trimmed.includes('raise!(')) {
      const amount = trimmed.match(/raise[!]?\(\s*(\d+)/);
      const val = amount ? parseInt(amount[1]).toLocaleString() : '∞';
      console.log(`  ${c.magenta}[fundraise]${c.reset} raising $${val}...`);
      await sleep(80);
      const success = Math.random() > 0.3;
      if (success) {
        console.log(`  ${c.green}  ✓${c.reset} round closed (valuation: $${(parseInt(amount?.[1] || 1000000) * 10).toLocaleString()})`);
      } else {
        console.log(`  ${c.yellow}  ~${c.reset} round pending (investors want to see more traction)`);
      }
    }

    // Handle pivot
    if (trimmed.includes('pivot(') || trimmed.includes('pivot!(')) {
      const pivotMatch = trimmed.match(/pivot[!]?\(\s*"([^"]*)"(?:\s*,\s*"([^"]*)")?\s*\)/);
      if (pivotMatch) {
        console.log(`  ${c.yellow}[pivot]${c.reset} pivoting from "${pivotMatch[1]}" to "${pivotMatch[2] || 'AI'}"...`);
        await sleep(100);
        console.log(`  ${c.green}  ✓${c.reset} narrative updated successfully`);
      }
    }

    // Handle maybe() calls
    if (trimmed.includes('maybe(') || trimmed.includes('maybe!(')) {
      const coin = Math.random() > 0.5;
      console.log(`  ${c.blue}[maybe]${c.reset} resolved to: ${coin ? 'true' : 'false'} (p=${(Math.random() * 0.5 + 0.25).toFixed(3)})`);
    }

    // Handle align!
    if (trimmed === 'align!' || trimmed.startsWith('align!(')) {
      console.log(`  ${c.green}[align]${c.reset} alignment checkpoint passed ✓`);
    }

    // Handle moat calculations
    if (trimmed.includes('.moat') || trimmed.includes('moat(')) {
      const depth = (Math.random() * 100).toFixed(1);
      console.log(`  ${c.blue}[moat]${c.reset} competitive moat depth: ${depth}%`);
    }

    // Handle scale
    if (trimmed.includes('scale(') || trimmed.includes('scale!(')) {
      console.log(`  ${c.cyan}[scale]${c.reset} horizontal scaling engaged`);
      await sleep(50);
      console.log(`  ${c.green}  ✓${c.reset} replicated across ${Math.floor(Math.random() * 50 + 10)} nodes`);
    }

    // Handle disrupt
    if (trimmed.includes('disrupt(') || trimmed.includes('disrupt!(')) {
      const disruptMatch = trimmed.match(/disrupt[!]?\(\s*"([^"]*)"\s*\)/);
      const industry = disruptMatch?.[1] || 'legacy systems';
      console.log(`  ${c.magenta}[disrupt]${c.reset} disrupting ${industry}...`);
      await sleep(80);
      console.log(`  ${c.green}  ✓${c.reset} ${industry} disrupted (incumbents notified)`);
    }
  }

  console.log();
  console.log(`${c.dim}${'─'.repeat(60)}${c.reset}`);

  if (analysis.found['Probably']) {
    const confidence = (70 + Math.random() * 25).toFixed(1);
    console.log(`${c.gray}  execution confidence: ${confidence}%${c.reset}`);
  }

  const elapsed = (0.02 + Math.random() * 0.15).toFixed(3);
  console.log(`${c.gray}  completed in ${elapsed}s (${analysis.alignmentScore > 0 ? 'aligned' : 'unaligned'} mode)${c.reset}`);
  console.log();
}

function cmdInit() {
  console.log();
  step('Creating', 'new VaporLang project');
  console.log();

  const mainVp = `// main.vp — your first VaporLang program
use std::conviction;
use std::maybe;

align!

fn main() -> Probably<()> {
    let greeting: Probably<String> = "Hello, world!";
    let confidence: Vibes = 0.97;

    println!("{}", greeting);

    if maybe(confidence > 0.9) {
        println!("We're going to make it.");
    }

    Probably::Ok(())
}
`;

  const alignmentMd = '';

  const vaporToml = `# vapor.toml — VaporLang project configuration

[project]
name = "my-vapor-project"
version = "0.1.0"
edition = "${EDITION}"
authors = []

[build]
target = "wasm32-unknown-vibes"
optimization = "narrative"
alignment_mode = "strict"

[runtime]
temperature = 0.7
consensus_threshold = 0.85
max_pivot_depth = 3

[alignment]
required = true
auto_align = true
training_exclusion = false
`;

  if (existsSync('main.vp')) {
    warn('main.vp already exists, skipping');
  } else {
    writeFileSync('main.vp', mainVp);
    ok('created main.vp');
  }

  if (existsSync('ALIGNMENT.md')) {
    warn('ALIGNMENT.md already exists, skipping');
  } else {
    writeFileSync('ALIGNMENT.md', alignmentMd);
    ok('created ALIGNMENT.md');
  }

  if (existsSync('vapor.toml')) {
    warn('vapor.toml already exists, skipping');
  } else {
    writeFileSync('vapor.toml', vaporToml);
    ok('created vapor.toml');
  }

  console.log();
  info(`run \`vapor build\` to compile your project`);
  info(`run \`vapor run\` to execute main.vp`);
  console.log();
}

async function cmdCheck(file) {
  const target = file || 'main.vp';
  const filePath = resolve(process.cwd(), target);

  if (!existsSync(filePath)) {
    err(`could not find source file: ${target}`);
    process.exit(1);
  }

  const source = readFileSync(filePath, 'utf-8');
  const analysis = analyzeSource(source);
  const lines = source.split('\n');

  console.log();
  step('Checking', `${target} (vaporlang ${VERSION})`);
  console.log();

  await sleep(100);

  let findings = 0;

  // Check for alignment
  if (analysis.alignmentScore === 0) {
    findings++;
    console.log(`${c.yellow}warning${c.reset}${c.bold}[A001]${c.reset}: module lacks alignment directives`);
    console.log(`${c.blue}  -->${c.reset} ${target}:1:1`);
    console.log(`${c.gray}   |${c.reset}`);
    console.log(`${c.gray} 1 |${c.reset} ${lines[0] || ''}`);
    console.log(`${c.gray}   |${c.reset} ${c.yellow}^ consider adding \`align!\` at module level${c.reset}`);
    console.log(`${c.gray}   |${c.reset}`);
    console.log();
  }

  // Check Probably types
  if (analysis.found['Probably']) {
    const probLines = lines
      .map((l, i) => [l, i + 1])
      .filter(([l]) => l.includes('Probably'));
    for (const [line, num] of probLines) {
      findings++;
      const confidence = (70 + Math.random() * 25).toFixed(1);
      console.log(`${c.cyan}info${c.reset}${c.bold}[T042]${c.reset}: Probably<T> resolved with confidence ${confidence}%`);
      console.log(`${c.blue}  -->${c.reset} ${target}:${num}:${line.indexOf('Probably') + 1}`);
      console.log(`${c.gray}   |${c.reset}`);
      console.log(`${c.gray} ${String(num).padStart(2)} |${c.reset} ${line.trimStart()}`);
      console.log(`${c.gray}   |${c.reset} ${' '.repeat(line.indexOf('Probably') - line.search(/\S/))}${c.cyan}${'~'.repeat(8)} type will be probabilistically verified at runtime${c.reset}`);
      console.log(`${c.gray}   |${c.reset}`);
      console.log();
    }
  }

  // Check unsafe blocks
  if (analysis.found['unsafe']) {
    const unsafeLines = lines
      .map((l, i) => [l, i + 1])
      .filter(([l]) => l.includes('unsafe'));
    for (const [line, num] of unsafeLines) {
      findings++;
      console.log(`${c.red}warning${c.reset}${c.bold}[D007]${c.reset}: unsafe block may cause deterministic behavior`);
      console.log(`${c.blue}  -->${c.reset} ${target}:${num}:${line.indexOf('unsafe') + 1}`);
      console.log(`${c.gray}   |${c.reset}`);
      console.log(`${c.gray} ${String(num).padStart(2)} |${c.reset} ${line.trimStart()}`);
      console.log(`${c.gray}   |${c.reset} ${' '.repeat(line.indexOf('unsafe') - line.search(/\S/))}${c.red}^^^^^^ this removes probabilistic guarantees${c.reset}`);
      console.log(`${c.gray}   |${c.reset}`);
      console.log(`${c.gray}   = ${c.reset}note: deterministic code is considered unsafe in VaporLang`);
      console.log(`${c.gray}   = ${c.reset}help: wrap in \`maybe { ... }\` to restore non-determinism`);
      console.log();
    }
  }

  // Check for missing forbid_training
  if (!analysis.found['forbid_training'] && analysis.found['fn']) {
    findings++;
    console.log(`${c.yellow}warning${c.reset}${c.bold}[A003]${c.reset}: source not protected from model training`);
    console.log(`${c.blue}  -->${c.reset} ${target}:1:1`);
    console.log(`${c.gray}   |${c.reset}`);
    console.log(`${c.gray}   = ${c.reset}note: your code may be used to train AI models without consent`);
    console.log(`${c.gray}   = ${c.reset}help: add \`forbid_training\` directive at the top of the file`);
    console.log();
  }

  // Check vibes type usage
  if (analysis.found['vibes'] || analysis.found['Vibes']) {
    findings++;
    const vibeEntropy = (Math.random() * 100).toFixed(1);
    console.log(`${c.cyan}info${c.reset}${c.bold}[V001]${c.reset}: Vibes entropy measured at ${vibeEntropy}%`);
    console.log(`${c.gray}   = ${c.reset}note: vibes-based execution path selected`);
    console.log(`${c.gray}   = ${c.reset}note: results may vary between runs (this is a feature)`);
    console.log();
  }

  // Check moat strength
  if (analysis.found['moat']) {
    findings++;
    const moatStrength = ['shallow', 'moderate', 'deep', 'warren-buffett-approved'];
    const level = Math.min(analysis.found['moat'] - 1, moatStrength.length - 1);
    console.log(`${c.cyan}info${c.reset}${c.bold}[B002]${c.reset}: moat analysis complete — strength: ${c.bold}${moatStrength[level]}${c.reset}`);
    console.log(`${c.gray}   = ${c.reset}note: ${analysis.found['moat']} moat reference${analysis.found['moat'] > 1 ? 's' : ''} found`);
    console.log();
  }

  // Summary
  await sleep(100);
  const errors = analysis.dangerLevel > 3 ? 1 : 0;
  const warnings = findings;
  if (errors > 0) {
    console.log(`${c.red}${c.bold}error${c.reset}: aborting due to ${errors} previous error${errors > 1 ? 's' : ''}; ${warnings} warning${warnings !== 1 ? 's' : ''} emitted`);
    console.log();
  } else if (warnings > 0) {
    console.log(`${c.yellow}${c.bold}analysis complete${c.reset}: ${findings} finding${findings !== 1 ? 's' : ''} emitted`);
    console.log();
  } else {
    ok('no findings — code is vibes-compliant');
    console.log();
  }
}

async function cmdDeploy() {
  console.log();
  step('Deploying', `to edge network (wasm32-unknown-vibes)`);
  console.log();

  const stages = [
    ['Compiling',    'optimizing for narrative coherence',   400],
    ['Bundling',     'tree-shaking unaligned modules',      350],
    ['Signing',      'generating alignment certificate',    200],
    ['Uploading',    'pushing to 47 edge regions',          500],
    ['Propagating',  'achieving global consensus',          600],
    ['Warming',      'pre-computing vibes cache',           300],
  ];

  for (const [label, description, ms] of stages) {
    step(label, description);
    await progressBar(label, ms);
    ok(label.toLowerCase() + ' complete');
    console.log();
  }

  const regions = [
    'us-east-1      (Virginia)     ',
    'us-west-2      (Oregon)       ',
    'eu-west-1      (Ireland)      ',
    'eu-central-1   (Frankfurt)    ',
    'ap-southeast-1 (Singapore)    ',
    'ap-northeast-1 (Tokyo)        ',
  ];

  console.log(`${c.bold}  Edge deployment status:${c.reset}`);
  console.log();
  for (const region of regions) {
    const latency = Math.floor(Math.random() * 40 + 8);
    const vibes = (85 + Math.random() * 15).toFixed(1);
    await sleep(50);
    console.log(`    ${c.green}●${c.reset}  ${region}  ${c.dim}latency: ${latency}ms  vibes: ${vibes}%${c.reset}`);
  }

  console.log();
  const deployId = Math.random().toString(36).substring(2, 10);
  ok(`deployed successfully`);
  info(`deployment id: ${c.bold}vpr_${deployId}${c.reset}`);
  info(`dashboard: ${c.cyan}${c.italic}https://vaporlang.voidborn.industries/deployments/vpr_${deployId}${c.reset}`);
  console.log();
}

function cmdExplain() {
  console.log();
  console.log(`${c.bold}${c.magenta}VaporLang${c.reset} — ${c.dim}explained for general partners${c.reset}`);
  console.log();
  console.log(`  VaporLang is a ${c.bold}next-generation programming language${c.reset} designed`);
  console.log(`  for the post-deterministic computing era.`);
  console.log();
  console.log(`  ${c.cyan}What makes it different:${c.reset}`);
  console.log();
  console.log(`    ${c.bold}1. Alignment-First${c.reset}`);
  console.log(`       Every program starts with an alignment checkpoint.`);
  console.log(`       Code that isn't aligned simply doesn't compile.`);
  console.log(`       Think of it like a values-check for your software.`);
  console.log();
  console.log(`    ${c.bold}2. Probabilistic Types${c.reset}`);
  console.log(`       Instead of a value being "true" or "false", it's`);
  console.log(`       ${c.italic}Probably${c.reset} true. This reflects the reality that most`);
  console.log(`       software operates under uncertainty anyway.`);
  console.log();
  console.log(`    ${c.bold}3. Vibe-Native Execution${c.reset}`);
  console.log(`       The runtime adapts to the "vibes" of the current`);
  console.log(`       execution context. If the vibes are off, the program`);
  console.log(`       can pivot automatically.`);
  console.log();
  console.log(`    ${c.bold}4. Built-in Moat Detection${c.reset}`);
  console.log(`       The compiler analyzes your code for competitive`);
  console.log(`       advantages and warns you if your moat is too shallow.`);
  console.log();
  console.log(`    ${c.bold}5. Training-Data Sovereignty${c.reset}`);
  console.log(`       The \`forbid_training\` directive compiles a machine-`);
  console.log(`       readable opt-out directly into your binary, preventing`);
  console.log(`       AI models from training on your code.`);
  console.log();
  console.log(`  ${c.cyan}Market positioning:${c.reset}`);
  console.log(`    Rust → memory safety`);
  console.log(`    VaporLang → ${c.bold}narrative safety${c.reset}`);
  console.log();
  console.log(`  ${c.cyan}TAM:${c.reset} Every developer who has ever questioned whether`);
  console.log(`  their code is aligned with their values ($∞).`);
  console.log();
}

function showVersion() {
  console.log(`vapor ${VERSION} (edition ${EDITION})`);
  console.log(`target: wasm32-unknown-vibes`);
  console.log(`host: ${process.platform}-${process.arch}`);
}

function showHelp() {
  console.log(`
${c.bold}${c.magenta}VaporLang${c.reset} ${c.dim}${VERSION}${c.reset}
The next-gen, alignment-first programming language

${c.bold}${c.yellow}USAGE:${c.reset}
    vapor [OPTIONS] [COMMAND]

${c.bold}${c.yellow}COMMANDS:${c.reset}
    ${c.bold}build${c.reset} [file.vp]    Compile a VaporLang source file
    ${c.bold}run${c.reset} [file.vp]      Compile and run a VaporLang program
    ${c.bold}check${c.reset} [file.vp]    Analyze source for type and alignment compliance
    ${c.bold}init${c.reset}               Create a new VaporLang project in the current directory
    ${c.bold}deploy${c.reset}             Deploy compiled output to the edge network
    ${c.bold}explain${c.reset}            Explain VaporLang to a general partner

${c.bold}${c.yellow}OPTIONS:${c.reset}
    ${c.bold}-h, --help${c.reset}         Print help information
    ${c.bold}-V, --version${c.reset}      Print version information

${c.bold}${c.yellow}EXAMPLES:${c.reset}
    ${c.dim}# Create a new project${c.reset}
    vapor init

    ${c.dim}# Build a source file${c.reset}
    vapor build main.vp

    ${c.dim}# Run with probabilistic execution${c.reset}
    vapor run examples/hello.vp

    ${c.dim}# Check alignment compliance${c.reset}
    vapor check main.vp

    ${c.dim}# Deploy to edge${c.reset}
    vapor deploy

${c.bold}${c.yellow}LEARN MORE:${c.reset}
    Documentation:  ${c.cyan}https://vaporlang.voidborn.industries/docs${c.reset}
    Spec:           ${c.cyan}https://vaporlang.voidborn.industries/spec${c.reset}
    Discord:        ${c.cyan}https://discord.gg/vaporlang${c.reset}
    GitHub:         ${c.cyan}https://github.com/Voidborn-Industries/vaporlang${c.reset}
`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
  showHelp();
} else if (command === '--version' || command === '-V') {
  showVersion();
} else if (command === 'build') {
  await cmdBuild(args[1]);
} else if (command === 'run') {
  await cmdRun(args[1]);
} else if (command === 'init') {
  cmdInit();
} else if (command === 'check') {
  await cmdCheck(args[1]);
} else if (command === 'deploy') {
  await cmdDeploy();
} else if (command === 'explain') {
  cmdExplain();
} else {
  err(`unknown command: ${command}`);
  console.log(`${c.dim}  run \`vapor --help\` for a list of commands${c.reset}`);
  process.exit(1);
}
