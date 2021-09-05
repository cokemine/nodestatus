FROM node:16-slim as builder

LABEL maintainer="Kagurazaka Mizuki"

WORKDIR /app
COPY . /app

ARG USE_CHINA_MIRROR=0

RUN if [ "$USE_CHINA_MIRROR" = 1 ]; then \
  sed -i 's/http:\/\/.*\.debian.org/http:\/\/mirrors.aliyun.com/g' /etc/apt/sources.list \
  && npm config set registry https://registry.npm.taobao.org \
  && yarn config set registry https://registry.npm.taobao.org; \
  fi;\
  apt-get -y update \
  && apt-get install -y git python3 apt-transport-https ca-certificates build-essential \
  && ln -s /usr/bin/python3 /usr/bin/python \
  && yarn install \
  && yarn build


FROM node:16-alpine as app

WORKDIR /app

COPY --from=0 /app/package.json ./
COPY --from=0 /app/LICENSE ./
COPY --from=0 /app/yarn.lock ./
COPY --from=0 /app/build ./build
COPY --from=0 /app/dist ./dist
COPY --from=0 /app/bin ./bin
COPY --from=0 /app/script ./script


ENV IS_DOCKER=true
ENV NODE_ENV=production
ARG USE_CHINA_MIRROR=0

RUN if [ "$USE_CHINA_MIRROR" = 1 ]; then \
  sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
  && npm config set registry https://registry.npm.taobao.org \
  && yarn config set registry https://registry.npm.taobao.org; \
  fi;\
  apk add --no-cache --virtual .build-deps git make gcc g++ python3 \
  && ln -s /usr/bin/python3 /usr/bin/python \
  && yarn install --production \
  && npm install pm2 -g \
  && npm cache clean --force \
  && yarn cache clean \
  && apk del .build-deps

EXPOSE 35601

CMD ["pm2-runtime", "start", "npm" , "--", "start"]
