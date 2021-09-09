# NodeStatus

Yet another servers monitor written in TypeScript.

Current Version: 1.0.0-alpha.6

## How To Install

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


#Install From NPM
npm i yarn pm2 -g
npm i nodestatus-server -g --unsafe-perm=true --allow-root # will install status-cli status-server status-server-run in your computer
status-server # start nodestatus-server
status-server-run # start nodestatus-server with pm2
status-cli help # check cli help
pm2 status # check running status
pm2 log nodestatus # check logs
```

### Install with Docker

```bash
# Install Docker with docker-compose
curl -fsSL https://get.docker.com | bash -s docker
docker --version
sudo curl -L "https://github.com/docker/compose-cli/releases/download/v2.0.0-rc.2/docker-compose-linux-amd64" -o /usr/local/bin/docker-compose #For x86_64
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
docker-compose --version

# Download docker-compose.yml
mkdir ~/nodestatus
cd ~/nodestatus
wget https://raw.githubusercontent.com/cokemine/nodestatus/master/docker-compose.yml
vim docker-compose.yml #修改环境变量相关配置
docker-compose compose up -d
```

## Client

Golang Version: https://github.com/cokemine/nodestatus-client-go

Node.js Version: https://github.com/cokemine/nodestatus-client

## How To Debug

```shell
mkdir -p /usr/local/nodestatus && cd /usr/local/nodestatus
git clone --recurse-submodules https://github.com/cokemine/nodestatus.git .
yarn
yarn build
yarn dev
```

## Environment

关于环境变量的相关配置，如果是使用 Docker 请直接在 docker-compose.yml 配置文件中修改

**INTERVAL**: 服务端推送间隔时间, 默认 1500 (1.5秒)

**DATABASE**: sqlite 数据库文件存放位置, 默认(Linux): `/usr/local/NodeStatus/server/db.sqlite`

**PORT**: NodeStatus 所用端口, 默认 35601

&nbsp;

**USE_PUSH**: 是否使用 Telegram 推送, 默认 true

**USE_IPC**: 是否需要 IPC 修改服务端配置, 默认 true

**USE_WEB**: 是否需要开启一个小型 web 面板修改服务端配置, 默认 true

&nbsp;

**WEB_USERNAME**: WEB 面板用户名，默认 admin

**WEB_PASSWORD**: WEB 面板密码

**WEB_SECRET**: 用于 jsonwebtoken, 建议设为一个随机的字符串, 默认不填即和密码相同

&nbsp;

**TGBOT_TOKEN**: Telegram Bot Token (从 BotFather 申请到)

**TGBOT_CHATID**: Telegram Bot 需要推送的 chat_id, 如不清楚可以先启动 NodeStatus, 对 Bot 发送 `/start` 获取这个 id, 多个请用`,`隔开

**TGBOT_PROXY**: Telegram 代理服务器配置，例`http://127.0.0.1:10808`，仅支持 http 代理

**TGBOT_WEBHOOK**： Telegram Webhook 配置，不填写默认 Polling,例: `https://tz.mydomain.com`，使用 Webhook 务必需要开启 https

## CLI Options

```shell
Options:
  -db, --database <db>       the path of database (default: "/usr/local/nodestatus/db.sqlite")
  -p, --port <port>          the port of NodeStatus (default: "35601")
  -i, --interval <interval>  update interval (default: "1500")
  -h, --help                 display help for command
```
