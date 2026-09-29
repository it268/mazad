# --- build ---
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_PB_URL=https://mazad-api.alfrusiyaar.com
ENV VITE_PB_URL=$VITE_PB_URL

RUN npm run build

# --- run ---
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000

COPY --from=build /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
