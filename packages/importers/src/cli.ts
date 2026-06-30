#!/usr/bin/env node
import { runImport } from './import-production.js';

const dryRun = process.argv.includes('--mode=dry-run') || process.argv.includes('--dry-run');
const report = runImport({ dryRun });
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exit(1);
