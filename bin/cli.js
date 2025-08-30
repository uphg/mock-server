#!/usr/bin/env node

import { program } from 'commander'
import { initCommand } from '../src/cli/init.js'
import { startCommand } from '../src/cli/start.js'
import { docsCommand } from '../src/cli/docs.js'

program
  .name('mock-server')
  .description('CLI tool for mock server with auto-generated documentation')
  .version('1.0.0')

program
  .command('init')
  .description('Initialize mock server configuration and sample data')
  .option('-d, --dir <directory>', 'Target directory', '.')
  .action(initCommand)

program
  .command('start')
  .description('Start the mock server')
  .option('-c, --config <config>', 'Configuration file path', 'mock.config.json')
  .option('-p, --port <port>', 'Server port')
  .option('--dev', 'Development mode with hot reload')
  .action(startCommand)

program
  .command('docs')
  .description('Generate API documentation')
  .option('-c, --config <config>', 'Configuration file path', 'mock.config.json')
  .option('-o, --output <output>', 'Documentation output directory', 'docs')
  .option('--dev', 'Start documentation dev server')
  .option('--build', 'Build static documentation')
  .action(docsCommand)

program.parse()