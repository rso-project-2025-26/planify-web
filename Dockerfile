FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG NG_BUILD_CONFIG=production
RUN npm run build -- --configuration=${NG_BUILD_CONFIG}

FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/planify-web /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
