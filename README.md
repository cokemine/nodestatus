# NodeStatus

Yet another servers monitor written in TypeScript.

Current Version: 1.0.0-alpha

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

## How To Use

```shell
mkdir -p /usr/local/nodestatus && cd /usr/local/nodestatus
git clone --recurse-submodules https://github.com/cokemine/nodestatus.git .
yarn
yarn build
yarn start
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
- xyStatus: https://github.com/xytoki/xyStatus (GPLv3)

