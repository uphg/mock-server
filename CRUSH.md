# CRUSH.md - Mock Server Development Guide

## Build/Test Commands
```bash
pnpm start                    # Start production server
pnpm dev                      # Start dev server with hot reload
pnpm test                     # Run all tests
pnpm test:watch               # Run tests in watch mode
node --test tests/configLoader.test.js  # Run single test file
node --test --test-name-pattern="should support simple wildcard" tests/configLoader.test.js  # Run specific test
```

## Code Style Guidelines
- **Imports**: ES modules only (`import`/`export`), no `require()`
- **Naming**: camelCase for variables/functions, PascalCase for classes, UPPER_SNAKE_CASE for constants
- **Error handling**: Use descriptive error messages in Chinese for user-facing errors, English for internal
- **Async/await**: Prefer async/await over callbacks, always use try/catch for async operations
- **Comments**: Use Chinese for business logic comments, English for technical documentation
- **File structure**: One class per file, filename matches exported class (kebab-case)
- **JSON responses**: Always return objects, never arrays at root level
- **Logging**: Use console.log with emojis for startup messages, console.error for errors
- **Config validation**: Validate all config fields, provide clear error messages
- **Route patterns**: Use path-to-regexp syntax for URL patterns