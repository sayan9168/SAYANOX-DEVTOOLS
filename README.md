# SAYANOX DevTools
Local-first VS Code developer toolkit for code analysis, security scanning, project health and optional local AI.

## v0.3.0
- Interactive dashboard
- VS Code Quick Fix actions for selected safe transformations
- Diagnostics and workspace health
- Security scanning
- Optional Ollama local AI
- No paid AI API required

## Commands
- SAYANOX: Analyze Current File
- SAYANOX: Security Scan
- SAYANOX: Project Health
- SAYANOX: Open Dashboard
- SAYANOX: Ask Local AI

## Build
```bash
npm install
npm run check
npm run compile
npm run package
```

Quick fixes are intentionally conservative; review every change before saving or committing.
