# syntax=docker/dockerfile:1

# Stage 1: build the static React app
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
	npm ci

COPY . .

# Vite bakes VITE_* vars into the static bundle at build time (import.meta.env
# references are statically replaced during the build), so they must be
# passed as build args (not runtime container env vars).
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Stage 2: serve the build with nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
