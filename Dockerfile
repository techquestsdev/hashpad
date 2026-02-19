# Runtime stage - serve static files with Caddy
FROM caddy:2-alpine

WORKDIR /app

ENV ROOT_PATH=/app

# Copy static files
COPY index.html .
COPY qr.html .
COPY 404.html .
COPY manifest.json .
COPY favicon.ico .
COPY favicon.png .
COPY icon.png .
COPY icon-512.png .

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Remove file capabilities from Caddy so it can run with
# allowPrivilegeEscalation=false (we bind to high port 8080).
# Also create directories with proper permissions for non-root runtime.
RUN apk add --no-cache libcap attr \
  && setcap -r /usr/bin/caddy \
  && setfattr -x security.capability /usr/bin/caddy || true \
  && apk del libcap attr \
  && mkdir -p /config/caddy /data/caddy \
  && chown -R 1000:1000 /config /data

# Use non-root user
USER 1000:1000

# Expose port
EXPOSE 8080

# Add healthcheck to ensure the server is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
