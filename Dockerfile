# ===== Stage 1: Backend dependencies =====
FROM node:20-slim AS backend-deps

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ===== Stage 2: Backend runtime =====
FROM node:20-slim AS backend

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=backend-deps /app/node_modules ./node_modules
COPY backend/ .

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/index.js"]

# ===== Stage 3: Frontend build =====
FROM node:20 AS frontend-build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .

RUN npm run build

# ===== Stage 4: Frontend runtime (nginx) =====
FROM nginx:alpine AS frontend

COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
