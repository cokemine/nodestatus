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
  && yarn config set registry https://mirrors.cloud.tencent.com/npm/; \
  fi;\
  apt-get -y update \
  && apt-get install -y git python3 apt-transport-https ca-certificates build-essential \
  && ln -s /usr/bin/python3 /usr/bin/python \
  && yarn config set network-timeout 600000 \
  && npm install pnpm -g \
  && pnpm install --unsafe-perm \
  && pnpm build


FROM node:16-alpine as app

WORKDIR /app

COPY --from=0 /app/app-minimal ./


ENV IS_DOCKER=true
ENV NODE_ENV=production
ARG USE_CHINA_MIRROR=0
RUN if [ "$USE_CHINA_MIRROR" = 1 ]; then \
  sed -i 's/dl-cdn.alpinelinux.org/mirrors.cloud.tencent.com/g' /etc/apk/repositories \
  && npm config set registry https://mirrors.cloud.tencent.com/npm/ \
  && yarn config set registry https://mirrors.cloud.tencent.com/npm/; \
  fi;\
  apk add --no-cache --virtual .build-deps git make gcc g++ python3 \
  && npm install pm2 pnpm prisma@3.4.2 -g \
  && pnpm install --prod \
  && npm cache clean --force \
  && apk del .build-deps

WORKDIR /app/packages/nodestatus-server

EXPOSE 35601

CMD ["pm2-runtime", "start", "npm" , "--", "start"]
