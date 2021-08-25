# NodeStatus

Yet another servers monitor written in TypeScript.

Current Version: 1.0.0-alpha.2

## Install Node.js

```shell
# Using Ubuntu
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using Debian, as root
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt-get install -y nodejs
```

## Install dependencies

```bash
npm i yarn pm2 -g
```

## How To Install

#### From NPM

```shell
npm i nodestatus-server -g --unsafe-perm=true --allow-root # will install status-cli status-server status-server-run in your computer
status-server # start nodestatus-server
status-server-run # start nodestatus-server with pm2
status-cli help # check cli help
pm2 status # check running status
pm2 log nodestatus # check logs
```

## How To Debug

```shell
mkdir -p /usr/local/nodestatus && cd /usr/local/nodestatus
git clone --recurse-submodules https://github.com/cokemine/nodestatus.git .
yarn
yarn build
yarn dev
```

## Usage

```shell
Options:
  -db, --database <db>       the path of database (default: "/usr/local/nodestatus/db.sqlite")
  -p, --port <port>          the port of NodeStatus (default: "35601")
  -i, --interval <interval>  update interval (default: "1500")
  -h, --help                 display help for command
```

## 参考项目

- ServerStatus 及其相关项目: https://github.com/cokemine/ServerStatus-Hotaru (MIT)
- xyStatus: https://github.com/xytoki/xyStatus (GPLv2)

