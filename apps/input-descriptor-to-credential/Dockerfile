FROM node:18.12-alpine as base

WORKDIR /app

FROM base as builder

RUN apk add g++ make py3-pip

COPY common common
COPY rush.json .
COPY apps/vc-api/package.json apps/vc-api/package.json
COPY libraries/did/package.json libraries/did/package.json
COPY libraries/webkms/package.json libraries/webkms/package.json
COPY apps/input-descriptor-to-credential/package.json apps/input-descriptor-to-credential/package.json
COPY tests/e2e/package.json tests/e2e/package.json

RUN node common/scripts/install-run-rush.js install

COPY . .

RUN node common/scripts/install-run-rush.js build
RUN node common/scripts/install-run-rush.js deploy -s input-descriptor-to-credential

RUN cp -R ./apps/input-descriptor-to-credential/dist ./common/deploy/apps/input-descriptor-to-credential

FROM base as final
ENV NODE_ENV=production

EXPOSE 3000

COPY license-header.txt /app
COPY --from=builder /app/common/deploy /app

CMD ["node", "apps/input-descriptor-to-credential/dist/main.js"]
