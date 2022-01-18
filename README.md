# NodeStatus

Yet another servers monitor written in TypeScript.

Current Version: 1.2.3-beta.1

## How To Install

If you want to update from v1.1.0 to v1.2.0 or later, you need to rebuild the database to handle the breaking change.

```bash
mv /usr/local/NodeStatus/db.sqlite /usr/local/NodeStatus/db.sqlite.bak
```

### Install locally

```bash
# Install Node.js
# Using Ubuntu
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using Debian, as root
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt-get install -y nodejs

# RHEL, CentOS, CloudLinux, Amazon Linux or Fedora as root
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -


#Install From NPM, NodeStatus needs prisma-cli to generate db
npm i pm2 prisma -g
npm i nodestatus-server@latest --unsafe-perm -g # will install status-server status-server-run in your computer
status-server # start nodestatus-server
status-server-run # start nodestatus-server with pm2
pm2 status # check running status
pm2 log nodestatus # check logs

# How to Update
npm i nodestatus-server@latest --unsafe-perm -g
```

### Install with Docker (Recommended)

```bash
# Install Docker with docker-compose v2
curl -fsSL https://get.docker.com | bash -s docker
docker --version
mkdir -p ~/.docker/cli-plugins/
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose # for x86_64
chmod +x ~/.docker/cli-plugins/docker-compose

# Download docker-compose.yml
mkdir ~/nodestatus
cd ~/nodestatus
wget https://raw.githubusercontent.com/cokemine/nodestatus/master/docker-compose.yml
vim docker-compose.yml #修改环境变量相关配置
docker compose up -d

# How to Update
cd ~/nodestatus
docker compose down
docker pull cokemine/nodestatus:latest
docker compose up -d
```

## Client

Go Version: https://github.com/cokemine/nodestatus-client-go

Node.js Version: https://github.com/cokemine/nodestatus-client

## Environment

关于环境变量的相关配置，如果是使用 Docker 请直接在 `docker-compose.yml`配置文件中修改。

若为手动安装，则需要在本地用户目录下新建一个`.nodestatus/.env.local`文件（注意路径），在这个文件填写相关环境变量配置。

**INTERVAL**: 服务端推送间隔时间, 默认 `1500` (1.5秒)

**DATABASE**: 数据库位置文件存放位置, 默认使用 SQLite (Linux): `file:/usr/local/NodeStatus/server/db.sqlite`，支持的数据库有 `SQLite`、`MySQL`、`PostgreSQL`，请使用对应的正确数据源链接格式填写：`SQLite`应以`file:`开头, `MySQL`应以`mysql:`开头, `PostgreSQL`应以`postgresql:`开头。

**PORT**: NodeStatus 所用端口, 默认 `35601`

**VERBOSE**: 是否启动 verbose 模式，启动后会输出更多信息，默认 `false`

**THEME**： NodeStatus 前端使用的主题，默认 `hotaru-theme`, 可选 `hotaru-theme` | `classic-theme`

&nbsp;

**USE_PUSH**: 是否使用 Telegram 推送, 默认 `true`

**USE_IPC**: 是否需要 IPC 修改服务端配置, 默认 `true`

**USE_WEB**: 是否需要开启一个小型 web 面板修改服务端配置, 默认 `true`

&nbsp;

**WEB_USERNAME**: WEB 面板用户名，默认 `admin`

**WEB_PASSWORD**: WEB 面板密码

**WEB_SECRET**: 用于 jsonwebtoken, 建议设为一个随机的字符串, 默认不填即和密码相同

&nbsp;

**PUSH_TIMEOUT**: 客户端报警推送超时时间 (在这个时间内无论客户端发生了什么只要重新恢复与客户端的连接就不会推送),  默认`30` (30秒)

**PUSH_DELAY**: 报警推送服务启动延迟 (防止重启服务端后导致的集中推送),  默认`15` (15秒)

**TGBOT_TOKEN**: Telegram Bot Token (从 BotFather 申请到)

**TGBOT_CHATID**: Telegram Bot 需要推送的 chat_id, 如不清楚可以先启动 NodeStatus, 对 Bot 发送 `/start` 获取这个 id, 多个请用`,`隔开

**TGBOT_PROXY**: Telegram 代理服务器配置，例`http://127.0.0.1:10808`，仅支持 http 代理

**TGBOT_WEBHOOK**: Telegram Webhook 配置，不填写默认 Polling,例: `https://tz.mydomain.com`，使用 Webhook 务必需要开启 https，若你使用了https，则建议填写你的域名以开启  Webhook, 而非 Polling

## 部署到容器服务

如果你需要将 NodeStatus 部署到如 Railway 或 Okteto 等容器服务中。请注意数据持久化问题。你应该使用外部的`MySQL`或是 `PostgreSQL`而不是本项目默认的`SQLite`，因为如果使用`SQLite`在每次重置服务端都会导致原有的配置失效。使用时注意通过调整环境变量以使用可持续存储的数据库服务。

目前本项目还无法部署到如 Vercel 等 Serverless 服务中，因为目前 Serverless 不支持 WebSocket。

## 修改客户端配置

NodeStatus 有两种方式修改（添加 / 删除）服务器配置。

### NodeStatus-cli

若你启用了 IPC, 则可以通过`status-cli`修改服务器相关配置。

```shell
npm i nodestatus-cli -g
status-cli help # check cli help
```

### Web

若你启用了 Web, 则可以通过 Web 修改服务器相关配置。不需要手动安装，访问`http://tz.domain.com/admin`即可访问面板。

同时通过 Web 面板你可以很简单的从 ServerStatus 迁移至 NodeStatus, 你可以在面板`Import`处将 ServerStatus 的 JSON文件粘贴过去一键添加服务器。（需要去除多余的 `host` 字段）

面板开源地址：https://github.com/cokemine/nodestatus/tree/master/web/hotaru-admin

## Telegram Commands

`/start` 查询当前`chat_id`，当前 NodeStatus 版本号

`/status` 查询当前所有服务器状态信息

## Reverse Proxy

下面是对几种常见 Web 服务器配置反向代理的实例

### Nginx

```nginx
server {
  listen 80;
  listen [::]:80;
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  ssl_certificate /etc/nginx/conf.d/ssl/status.domain.com.crt; # SSL 证书路径
  ssl_certificate_key /etc/nginx/conf.d/ssl/status.domain.com.key; # SSL Key 证书路径
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
  ssl_ciphers TLS13-AES-256-GCM-SHA384:TLS13-CHACHA20-POLY1305-SHA256:TLS13-AES-128-GCM-SHA256:TLS13-AES-128-CCM-8-SHA256:TLS13-AES-128-CCM-SHA256:EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
  ssl_prefer_server_ciphers on;
  ssl_session_timeout 10m;
  ssl_session_cache builtin:1000 shared:SSL:10m;
  ssl_buffer_size 1400;
  add_header Strict-Transport-Security max-age=15768000;
  ssl_stapling on;
  ssl_stapling_verify on;
  server_name status.domain.com; # 需要绑定的域名
  access_log /var/log/nginx/status.domain.com_nginx.log combined; # 日志位置, 目录如果不存在需要提前创建好

  location / {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_set_header X-NginX-Proxy true;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_pass http://127.0.0.1:35601; # 反代地址
    proxy_http_version 1.1;
  }
}
```

### Caddy V2

```
https://status.domain.com {
  encode zstd gzip
  # tls your_cert_file your_key_file
  # tls your_email
  reverse_proxy http://127.0.0.1:35601
}
```

### Caddy V1

```
https://status.domain.com {
  gzip
  # tls your_cert_file your_key_file
  # tls your_email
  proxy / http://127.0.0.1:35601 {
  	websocket
  	transparent
  }
}
```

## How To Debug

```shell
npm i pnpm -g
git clone https://github.com/cokemine/nodestatus.git
cd nodestatus
pnpm install
pnpm dev
```

## CLI Options

```shell
Options:
  -db, --database <db>       the path of database (default: "/usr/local/NodeStatus/server/db.sqlite")
  -p, --port <port>          the port of NodeStatus (default: "35601")
  -i, --interval <interval>  update interval (default: "1500")
  -h, --help                 display help for command
```
