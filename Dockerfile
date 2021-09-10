FROM node:16-slim as builder

LABEL maintainer="Kagurazaka Mizuki"

WORKDIR /app
COPY . /app

ENV IS_DOCKER=true
ARG USE_CHINA_MIRROR=0

RUN if [ "$USE_CHINA_MIRROR" = 1 ]; then \
  sed -i 's/http:\/\/.*\.debian.org/http:\/\/mirrors.aliyun.com/g' /etc/apt/sources.list \
  && npm config set registry https://registry.npm.taobao.org \
  && yarn config set registry https://registry.npm.taobao.org; \
  fi;\
  apt-get -y update \
  && apt-get install -y git python3 apt-transport-https ca-certificates build-essential \
  && ln -s /usr/bin/python3 /usr/bin/python \
  && yarn config set network-timeout 600000 \
  && mkdir .yarncache \
  && yarn install --frozen-lockfile --cache-folder ./.yarncache \
  && rm -rf .yarncache \
  && yarn build \
  && node script/minify-docker.js


FROM node:16-alpine as app

WORKDIR /app

COPY --from=0 /app/app-minimal ./


ENV IS_DOCKER=true
ENV NODE_ENV=production
ARG USE_CHINA_MIRROR=0

RUN if [ "$USE_CHINA_MIRROR" = 1 ]; then \
  sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
  && npm config set registry https://registry.npm.taobao.org \
  && yarn config set registry https://registry.npm.taobao.org; \
  fi;\
  npm install pm2 -g \
  && npm cache clean --force

EXPOSE 35601

CMD ["pm2-runtime", "start", "npm" , "--", "start"]
