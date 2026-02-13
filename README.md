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
- **Markdown Highlighting** - Real-time syntax highlighting for headings, code, bold, italic, links, and more
- **QR Code Sharing** - Generate QR codes for easy mobile sharing
- **Dark/Light Mode** - Automatically follows system preference
- **PWA Support** - Install as a native app on any device
- **Export Options** - Save as HTML or plain text
- **Undo/Redo** - Full editing history (Ctrl+Z / Ctrl+Shift+Z)

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
# Adapt values.yaml for your environment, then:
helm install hashpad ./helm
```

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
├── favicon.png         # App icon
├── icon.svg            # Vector icon
├── Dockerfile          # Container build (Caddy Alpine)
├── Caddyfile           # Web server configuration
├── docker-compose.yml  # Container orchestration
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
