# Vertex AI MCP Server Setup

Vertex AI MCP Server configuration files and schemas for Google Cloud Vertex AI integration.

## Configuration Files Created
- **`mcp_config.json`**: MCP Server registration configuration.
- **`generate_content.json`**: Tool schema for Gemini 1.5 Pro/Flash inference.
- **`generate_embeddings.json`**: Tool schema for `text-embedding-004` vector generation.

## How to Enable

1. Install Vertex AI MCP server:
   ```bash
   npm install -g @google-cloud/vertexai
   ```

2. Add `mcp_config.json` contents to your environment MCP configuration file.

3. Set environment variables:
   - `GCP_PROJECT_ID`
   - `GCP_LOCATION` (e.g. `us-central1`)
   - `GOOGLE_APPLICATION_CREDENTIALS` (path to GCP Service Account JSON key)
