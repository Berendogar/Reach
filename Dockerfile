FROM node:22-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends iputils-ping libcap2-bin && rm -rf /var/lib/apt/lists/*
# Hosts that do not grant CAP_NET_RAW refuse to start a ping with file capabilities.
# Without them ping falls back to an unprivileged ICMP socket.
RUN P="$(command -v ping)" && (setcap -r "$P" || true) && chmod u-s "$P"
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
