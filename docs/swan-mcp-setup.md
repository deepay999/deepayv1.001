# Swan MCP Setup

Last updated: 2026-04-15

## Installed MCP

Configured Claude Desktop with two Swan MCP servers:

- Server name: swan-docs
- URL: https://mcp.swan.io/docs/mcp
- Server name: swan-graphql
- URL: https://mcp.swan.io/graphql/mcp

Linux Claude Desktop config path used in this environment:

- ~/.config/Claude/claude_desktop_config.json

Current config content:

```json
{
  "mcpServers": {
    "swan-docs": {
      "url": "https://mcp.swan.io/docs/mcp"
    },
    "swan-graphql": {
      "url": "https://mcp.swan.io/graphql/mcp"
    }
  }
}
```

## Claude.ai Or Claude Desktop UI Setup

Steps:
1. Open Settings.
2. Open Connectors.
3. Choose Add custom connector.
4. Enter https://mcp.swan.io/docs/mcp.
5. Save and restart Claude Desktop if needed.

## Claude CLI

Command provided by Swan documentation:

```bash
claude mcp add --transport http swan-docs https://mcp.swan.io/docs/mcp
```

Note for this environment:
- Claude CLI was not found on PATH when checked, so CLI registration was not performed here.
- Desktop config was installed directly instead.

## Available Tool

- search-documentation: search Swan documentation and retrieve relevant guidance

## Server Roles

- swan-docs: search Swan documentation and retrieve guide-style answers
- swan-graphql: inspect Swan GraphQL schema, types, queries, and mutations

## Claude CLI

Equivalent GraphQL CLI command from Swan documentation:

```bash
claude mcp add --transport http swan-graphql https://mcp.swan.io/graphql/mcp
```
