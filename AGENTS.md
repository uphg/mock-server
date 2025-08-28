# Mock Server AGENTS.md

## Dev environment tips
- Use `pnpm start` or `node src/index.js` to start the mock server in production mode.
- Use `pnpm dev` or `node --watch src/index.js` for development with hot reload.
- Configuration file path can be specified: `node src/index.js ./custom-config.json`.
- Check `mock.config.json` for server configuration including port, baseUrl, CORS, and route definitions.
- Mock data files are stored in the `./data` directory by default (configurable via `mockDir`).
- The server supports hot reload for configuration changes in development mode.

## Testing instructions
- Run `pnpm test` to execute all tests using Node.js built-in test runner.
- Use `pnpm test:watch` for continuous testing during development.
- Test files are located in the `tests/` directory with `.test.js` extension.
- Available test suites: config loader, route generator, schema validation, e2e, and performance tests.
- Test configuration is in `tests/test.config.js` with setup/teardown in respective files.
- Mock server starts on a different port during testing to avoid conflicts.

## Documentation workflow
- Run `pnpm docs:generate` to build API documentation from route configurations.
- Use `pnpm docs:generate:watch` for automatic doc regeneration on config changes.
- Start documentation dev server with `pnpm docs:dev` (VitePress).
- Build static docs with `pnpm docs:build` and preview with `pnpm docs:preview`.
- Documentation is auto-generated based on routes defined in `mock.config.json`.
- API examples and route documentation are stored in the `docs/` directory.

## Configuration management
- Main config file: `mock.config.json` - defines server settings, routes, and defaults.
- Route defaults can be configured globally and applied to matching routes via `includes`/`excludes` patterns.
- Supports dynamic response templates using Handlebars syntax (e.g., `{{params.id}}`, `{{query.q}}`).
- Response data can be inline JSON or external files from the mock directory.
- CORS, delays, headers, and status codes are configurable per route or globally.

## PR instructions
- Title format: [mock-server] <Title>
- Always run `pnpm test` before committing to ensure all tests pass.
- Update documentation if adding new routes or changing configuration schema.
- Test both development and production modes if modifying server startup logic.
- Verify hot reload functionality works correctly for configuration changes.
