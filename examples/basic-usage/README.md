# Basic Usage Examples

This directory contains basic examples of using Mockfly commands.

## Examples

### 1. Init Example

Demonstrates how to initialize a new mock server project.

```bash
cd init-example
../../../bin/cli.js init
```

This creates the basic directory structure and sample configuration files.

### 2. Start Example

Shows how to start the mock server with a basic configuration.

```bash
cd start-example
../../../bin/cli.js start
```

The server will start on `http://localhost:3000` and serve the configured API endpoints.

### 3. Docs Example

Demonstrates API documentation generation.

```bash
cd docs-example
../../../bin/cli.js docs
```

This generates Markdown documentation for all configured API endpoints.