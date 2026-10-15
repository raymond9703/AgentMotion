# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

AgentMotion renders untrusted HTML/CSS/JavaScript in a headless browser.
If you find a security issue — especially anything that could escape the
render sandbox, read local files, or reach the network — please report it
responsibly.

**Do not open a public issue.** Email the details instead. Include:

- A minimal reproduction (the smallest HTML that triggers it)
- The render command used
- Affected platform (OS / browser channel)
- Impact assessment

We will acknowledge within 48 hours and aim to publish a fix within 30 days,
coordinating disclosure with you.

## Best practices when rendering untrusted input

`scripts/render.mjs` opens a real browser with no explicit content-isolation.
Only render HTML you trust. If you render third-party or AI-generated HTML,
run it in a disposable environment (container / VM / CI) and treat the output
media as untrusted.

If you need to render untrusted content in production, disable network access
and local-file access for the browser context, or run in a sandboxed runner.
