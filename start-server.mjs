#!/usr/bin/env node
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Register tsx loader
register('tsx/esm', pathToFileURL('./'));

// Import and run server
await import('./server/_core/index.ts');
