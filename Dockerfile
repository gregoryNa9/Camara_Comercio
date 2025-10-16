# syntax=docker/dockerfile:1

# Etapa 1: Build del frontend (React)
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend ./
RUN npm run build

# Etapa 2: Backend (Node/Express)
FROM node:20-alpine AS backend
WORKDIR /app

# Instalar dependencias del backend
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copiar código del backend y assets estáticos
COPY src ./src
COPY formulario-publico ./formulario-publico

# Copiar build del frontend para servirlo desde Express
COPY --from=frontend-build /frontend/build ./frontend/build

ENV NODE_ENV=production
ENV PORT=8080

# Asegurar carpetas usadas en runtime existen
RUN mkdir -p src/temp src/uploads

EXPOSE 8080

CMD ["node", "src/app.js"]


