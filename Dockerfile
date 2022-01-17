FROM node:16-slim as builder

LABEL maintainer="Kagurazaka Mizuki"

WORKDIR /app
COPY . /app

ENV IS_DOCKER=true
ARG BINARY_TARGETS="[\"linux-musl\"]"
ARG USE_CHINA_MIRROR=0

RUN if [ "$USE_CHINA_MIRROR" = 1 ]; then \
  sed -i 's/http:\/\/.*\.debian.org/http:\/\/mirrors.cloud.tencent.com/g' /etc/apt/sources.list \
  && npm config set registry https://mirrors.cloud.tencent.com/npm/ \
  && npm config set PRISMA_BINARIES_MIRROR https://r.cnpmjs.org/-/binary/prisma; \
  fi;\
  apt-get -y update \
  && apt-get install -y git python3 apt-transport-https ca-certificates build-essential \
  && ln -s /usr/bin/python3 /usr/bin/python \
  && npm install pnpm -g \
  && pnpm install --unsafe-perm \
  && pnpm build


FROM node:16-alpine as app

WORKDIR /app


COPY --from=0 /app/package.json ./
COPY --from=0 /app/.npmrc ./
COPY --from=0 /app/LICENSE ./
COPY --from=0 /app/pnpm-lock.yaml ./
COPY --from=0 /app/pnpm-workspace.yaml ./

COPY --from=0 /app/packages/nodestatus-cli/package.json ./packages/nodestatus-cli/

COPY --from=0 /app/packages/nodestatus-server/package.json ./packages/nodestatus-server/
COPY --from=0 /app/packages/nodestatus-server/build ./packages/nodestatus-server/build
COPY --from=0 /app/packages/nodestatus-server/scripts ./packages/nodestatus-server/scripts
COPY --from=0 /app/packages/nodestatus-server/prisma ./packages/nodestatus-server/prisma

COPY --from=0 /app/web/hotaru-theme/package.json ./web/hotaru-theme/
COPY --from=0 /app/web/hotaru-admin/package.json ./web/hotaru-admin/


ENV IS_DOCKER=true
ENV NODE_ENV=production
ARG USE_CHINA_MIRROR=0
RUN if [ "$USE_CHINA_MIRROR" = 1 ]; then \
  sed -i 's/dl-cdn.alpinelinux.org/mirrors.cloud.tencent.com/g' /etc/apk/repositories \
  && npm config set registry https://mirrors.cloud.tencent.com/npm/ \
  && npm config set PRISMA_BINARIES_MIRROR https://r.cnpmjs.org/-/binary/prisma; \
  fi;\
  apk add --no-cache --virtual .build-deps git make gcc g++ python3 \
  && npm install pm2 pnpm prisma -g \
  && pnpm install --prod --frozen-lockfile \
  && npm cache clean --force \
  && apk del .build-deps

EXPOSE 35601

CMD ["pm2-runtime", "start", "npm" , "--", "start"]
