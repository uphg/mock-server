# @mockfly/docs-plugin

Documentation generation plugin for Mockfly.

## Installation

```bash
npm install @mockfly/docs-plugin
```

## Usage

This plugin is automatically loaded when installed. It provides documentation generation capabilities for your Mockfly API routes.

## Features

- Generates Markdown documentation for all API routes
- Creates interactive API documentation with examples
- Supports parameter extraction from route templates
- Generates request/response examples
- Creates index documentation with route overview

## Generated Documentation

The plugin generates:
- Individual Markdown files for each route
- A README.md index file with route overview
- Parameter tables, request/response examples
- Error response documentation

## Configuration

The plugin uses the same configuration as Mockfly. Documentation output directory can be configured via:

- Environment variable: `DOCS_OUTPUT_DIR`
- Default: `./docs/api`

## API

### generateDocs(config, outputDir)

Generates documentation for the given configuration.

- `config`: Mockfly configuration object
- `outputDir`: Output directory for documentation (optional)