# ==============================================================================
# Frontend Dockerfile — React + Vite + Nginx
# ==============================================================================
# Multi-stage build: сборка в Node.js, запуск в Nginx

# --- Stage 1: Build ---
FROM node:20-alpine as builder

WORKDIR /app

# Копируем package.json и package-lock.json для кэширования
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --silent

# Копируем исходный код
COPY . .

# Сборка production билда
RUN npm run build


# --- Stage 2: Production (Nginx) ---
FROM nginx:alpine as production

# Удаляем дефолтную конфигурацию nginx
RUN rm -rf /usr/share/nginx/html/*

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем кастомную конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Создаём non-root пользователя (опционально для nginx)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Порт
EXPOSE 80

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]
