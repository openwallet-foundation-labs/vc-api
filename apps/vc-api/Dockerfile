FROM node:24 AS base

WORKDIR /app

RUN corepack enable

FROM base AS builder

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY patches patches
COPY apps/vc-api/package.json apps/vc-api/package.json
COPY tests/e2e/package.json tests/e2e/package.json
COPY libraries/did/package.json libraries/did/package.json
COPY libraries/webkms/package.json libraries/webkms/package.json

RUN pnpm install --frozen-lockfile

COPY tsconfig.json .
COPY libraries libraries
COPY apps apps
COPY tests tests

RUN pnpm --filter @energyweb/ssi-vc-api... run build
RUN pnpm deploy --legacy --filter @energyweb/ssi-vc-api --prod /app/deploy/apps/vc-api

FROM base AS final
ENV NODE_ENV=production
EXPOSE 3000

COPY --from=builder /app/deploy /app
COPY license-header.txt /app

CMD ["node", "apps/vc-api/dist/src/main.js"]
