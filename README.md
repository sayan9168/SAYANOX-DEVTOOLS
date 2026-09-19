# SAYANOX DevTools

A powerful, local-first VS Code developer toolkit for code analysis, security scanning, project health, and developer productivity.

## Features

- 🔎 Lightweight code analysis and code-smell detection
- 🛡️ Local SAST-style security checks
- 📊 Project health scan
- 🧠 Optional local AI through Ollama
- ⚡ No paid AI API required
- 🔐 Diagnostics appear directly in VS Code
- 🧩 TypeScript + VS Code Extension API

## Commands

Open the Command Palette and run:

- `SAYANOX: Analyze Current File`
- `SAYANOX: Security Scan`
- `SAYANOX: Project Health`
- `SAYANOX: Ask Local AI`

## Local AI

Install Ollama separately, pull a small model such as `gemma:1b`, then enable:

```json
{
  "sayanox.ollama.enabled": true,
  "sayanox.ollama.model": "gemma:1b",
  "sayanox.ollama.endpoint": "http://127.0.0.1:11434"
}
```

The extension works without Ollama; AI is optional.

## Development

```bash
npm install
npm run check
npm run compile
npm run package
```

Press F5 in VS Code to launch the Extension Development Host.

## Architecture

```
VS Code
  └─ SAYANOX DevTools
      ├─ Analyzer
      ├─ Security Scanner
      ├─ Project Health
      └─ Local AI Adapter → Ollama (optional)
```

## Security

This is a lightweight static-analysis layer, not a replacement for a full SAST platform. Findings should be reviewed before acting on them.

## License

Apache-2.0
