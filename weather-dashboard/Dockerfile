# Stage 1: build the static React app
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# CRA bakes REACT_APP_* vars into the static bundle at build time, so they
# must be passed as build args (not runtime container env vars).
ARG REACT_APP_API_SERVER
ARG REACT_APP_API_PORT
ENV REACT_APP_API_SERVER=${REACT_APP_API_SERVER}
ENV REACT_APP_API_PORT=${REACT_APP_API_PORT}

RUN npm run build

# Stage 2: serve the build with nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
