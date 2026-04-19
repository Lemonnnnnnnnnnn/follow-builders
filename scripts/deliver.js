#!/usr/bin/env node

// ============================================================================
// Follow Builders — ZeroClaw Delivery Shim
// ============================================================================
// ZeroClaw owns channel delivery. This script is kept only as a compatibility
// shim for workflows that pipe a finished digest to stdout.
//
// Usage:
//   echo "digest text" | node deliver.js
//   node deliver.js --message "digest text"
//   node deliver.js --file /path/to/digest.txt
// ============================================================================

import { readFile } from 'fs/promises';

async function getDigestText() {
  const args = process.argv.slice(2);

  const msgIdx = args.indexOf('--message');
  if (msgIdx !== -1 && args[msgIdx + 1]) {
    return args[msgIdx + 1];
  }

  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    return await readFile(args[fileIdx + 1], 'utf-8');
  }

  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function main() {
  const digestText = await getDigestText();

  if (!digestText || digestText.trim().length === 0) {
    console.log(JSON.stringify({ status: 'skipped', reason: 'Empty digest text' }));
    return;
  }

  console.log(digestText);
}

main().catch(err => {
  console.log(JSON.stringify({
    status: 'error',
    message: err.message
  }));
  process.exit(1);
});
