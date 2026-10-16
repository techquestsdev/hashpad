# HashPad

A minimal, serverless text editor that stores content entirely in the browser's URL hash. No backend, no database, no accounts - just share the URL.

## How It Works

```
Text Content
    |
    v
Compress (deflate) --> Encode (base64url) --> URL Hash
    |
    v
https://hashpad.example.com/#K0ktLtEhKAA=
```

Your document **is** the URL. Share it anywhere, and the recipient gets your exact content.

## Features

- **Zero Backend** - No server storage, no database, no accounts
- **URL-Based Storage** - Content is compressed and encoded in the URL hash
- **Password Protection** - Optional AES-256-GCM encryption with PBKDF2 key derivation
- **Markdown Highlighting** - Real-time syntax highlighting while you type (see [Supported Markdown](#supported-markdown))
- **QR Code Sharing** - Generate QR codes for easy mobile sharing
- **Dark/Light Mode** - Automatically follows system preference
- **PWA & Offline** - Install as a native app on any device; a service worker caches the app so it keeps working offline (the QR page also needs a prior online visit to cache its CDN library)
- **Export Options** - Save as HTML or plain text
- **Undo/Redo** - Full editing history (Ctrl+Z / Ctrl+Shift+Z)

## Supported Markdown

| Syntax | Example |
|--------|---------|
| Headings | `# H1` to `###### H6` |
| Bold | `**bold**`, `__bold__` |
| Italic | `*italic*`, `_italic_` |
| Strikethrough | `~~strike~~` |
| Highlight | `==mark==` |
| Inline code | `` `code` `` |
| Fenced code blocks | `` ``` `` or `~~~` |
| Links | `[text](https://url "title")`, `[text][ref]`, `<https://url>`, bare `https://url` |
| Images | `![alt](url)` |
| Lists | `-`, `*`, `+`, `1.` |
| Task lists | `- [ ]`, `- [x]` |
| Blockquotes with nesting | `> quote`, `> > nested` |
| Horizontal rules | `---`, `***`, `___` |
| Tables | `\| a \| b \|` |
| Footnote references | `[^1]` |
| Backslash escapes | `\*` |

- Syntax is highlighted in place; the text stays plain Markdown and is never rendered to HTML in the editor.
- Images are highlighted only, not loaded, so no third-party requests are made when opening a shared link.
- Only `http(s)` and `mailto:` links are clickable.

## URL Format

| Format | Description |
|--------|-------------|
| `#<data>` | Compressed content (deflate + base64url) |
| `#!<data>` | Password-encrypted content (AES-256-GCM) |

## Quick Start

### Local Development

```bash
# Serve with Python
python3 -m http.server 8080

# Open http://localhost:8080
```

### Docker

```bash
# Using docker compose
docker compose up -d

# Or build manually
docker build -t hashpad .
docker run -p 8080:8080 hashpad
```

### Kubernetes (Helm)

```bash
# Adapt deploy/helm/hashpad/values.yaml for your environment, then:
helm install hashpad ./deploy/helm/hashpad
```

## Testing

Browser tests use Playwright (Chromium) and run against `tests/sample.md`, which exercises every supported Markdown construct.

```bash
npm install
npx playwright install chromium
npm test
```

When adding new Markdown syntax, add it to `tests/sample.md` and add a matching assertion in `tests/markdown.spec.js`.

## Security

### Encryption Details

- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: Random 16 bytes per encryption
- **IV**: Random 12 bytes per encryption
- **Minimum Password**: 8 characters

## Architecture

```txt
hashpad/
├── index.html          # Main editor (single-file application)
├── qr.html             # QR code generator
├── 404.html            # Error page
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (offline cache)
├── favicon.png         # App icon
├── icon.svg            # Vector icon
├── Dockerfile          # Container build (Caddy Alpine)
├── Caddyfile           # Web server configuration
├── docker-compose.yml  # Container orchestration
├── tests/              # Playwright browser tests and Markdown sample
├── package.json        # Test tooling
└── deploy/helm/hashpad # Kubernetes Helm chart
    ├── Chart.yaml
    ├── values.yaml
    └── templates/
```

## Technology

| Component | Technology |
|-----------|------------|
| Editor | Vanilla JavaScript with `contenteditable` |
| Compression | Native `CompressionStream` API (deflate-raw) |
| Encryption | Web Crypto API (AES-256-GCM, PBKDF2) |
| QR Generation | qrcode-generator library |
| Web Server | Caddy 2 (HTTP/2, HTTP/3, auto HTTPS) |
| Container | Alpine Linux |

## Browser Support

Requires modern browsers with support for:
- CompressionStream/DecompressionStream API
- Web Crypto API
- ES2020+ JavaScript

Supported: Chrome 80+, Firefox 113+, Safari 16.4+, Edge 80+

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Inspired by the original [howto](https://github.com/antonmedv/textarea) by Anton Medvedev.

---

### Made with ❤️ and JavaScript
