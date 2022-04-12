FROM node:14-alpine as base

# Install the required packages
RUN apk add --no-cache curl \
    && curl -sL https://unpkg.com/@pnpm/self-installer | node
RUN npm install -g @microsoft/rush

COPY . .
RUN rush install && pnpm add -g pnpm && rush build

FROM node:14-alpine

COPY --from=base . .

EXPOSE 3000

WORKDIR /apps/vc-api

CMD [ "pnpm", "run", "start" ]
