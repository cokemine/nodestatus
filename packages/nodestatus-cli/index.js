import os from 'os';
import net from 'net';
import EventEmitter from 'events';
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import { program } from 'commander';
import countries from 'i18n-iso-countries';

const ERROR = chalk.red('[ERROR]');
const INFO = chalk.green('[INFO]');

const emitter = new EventEmitter();
const socket = net.connect({
  path: os.platform() === 'win32' ? '\\\\.\\pipe\\status_ipc' : '/tmp/status_unix.sock'
});

socket.on('error', error => {
  console.log(ERROR + ` 启动 NodeStatus-cli 出错, 错误信息: ${error.message}, 请检查 NodeStatus 是否正常运行`);
});
socket.on('data', buf => {
  const status = JSON.parse(buf.toString());
  if (status.data) {
    emitter.emit('list', status.data);
    return;
  }
  if (status.code) {
    console.log(ERROR + ` 请求失败, 错误信息: ${status.msg}`);
  } else {
    console.log(INFO + ` 请求成功: ${status.msg}`);
  }
  process.exit(status.code);
});


function getCode(value) {
  const code = countries.getAlpha2Code(value, 'zh');
  const codeEn = countries.getAlpha2Code(value, 'en');
  return code || codeEn || value.toUpperCase();
}

const questions = [
  {
    name: 'username',
    type: 'input',
    message: '请输入 NodeStatus 客户端的用户名[username]:'
  },
  {
    name: 'password',
    type: 'input',
    message: '请输入 NodeStatus 服务端要设置的密码[password]:'
  },
  {
    name: 'name',
    type: 'input',
    message: '请输入 NodeStatus 服务端要设置的节点名称[name]:'
  },
  {
    name: 'type',
    type: 'input',
    message: '请输入 NodeStatus 服务端要设置的节点虚拟化类型[type] (例如 OpenVZ / KVM) :'
  },
  {
    name: 'location',
    type: 'input',
    message: '请输入 NodeStatus 服务端要设置的节点位置[location]:',
  },
  {
    name: 'region',
    type: 'input',
    message: '请输入 NodeStatus 服务端要设置的节点地区[region]:',
    validate(value) {
      const code = getCode(value);
      if (countries.isValid(code)) return true;
      else return '你输入的节点地区不合法';
    },
    transformer: getCode
  },
  {
    name: 'disabled',
    type: 'list',
    message: '请输入 NodeStatus 服务端要设置的节点状态[disabled]:',
    choices: ['true', 'false'],
    when: () => false
  }
];

function createQuestions(key) {
  return questions.map(item => {
    if (key === 'disabled' && item.name === 'disabled')
      return {
        ...item,
        when: () => true
      };
    if (item.name !== key)
      return {
        ...item,
        when: () => false
      };
    return item;
  });
}

/* Add Method */
async function handleAdd() {
  const answer = await inquirer.prompt(questions);
  answer.region = getCode(answer.region);
  socket.write(`add @;@ ${JSON.stringify(answer)}`);
}

/* List Method */
function handleList() {
  socket.write('list');
  emitter.once('list', msg => {
    console.table(msg);
    process.exit(0);
  });
}

/* Modify Method */
function handleModify() {
  socket.write('list');
  emitter.once('list', async data => {
    console.table(data);
    const { username, key } = await inquirer.prompt([{
      name: 'username',
      type: 'list',
      choices: data.map(item => item.username),
      message: '请输入要修改的节点用户名:'
    }, {
      name: 'key',
      type: 'list',
      message: '请输入需要修改的客户端属性:',
      choices: ['username', 'password', 'name', 'type', 'location', 'region', 'disabled']
    }]);

    let answer = await inquirer.prompt(createQuestions(key), { username });

    if (answer.region) answer.region = getCode(answer.region);

    if (key === 'username') {
      const { newUserName } = await inquirer.prompt([
        {
          name: 'newUserName',
          type: 'input',
          message: '请输入新节点的用户名[newUserName]:'
        }
      ]);
      answer = Object.assign(answer, { newUserName });
    }
    socket.write(`set @;@ ${JSON.stringify(answer)}`);
  });
}

/* Delete Method */
function handleDelete() {
  socket.write('list');
  emitter.on('list', async data => {
    console.table(data);
    const answer = await inquirer.prompt([
      {
        name: 'username',
        type: 'list',
        message: '请输入要删除的节点用户名',
        choices: data.map(item => item.username)
      }
    ]);
    socket.write(`del @;@ ${answer.username}`);
  });
}

function init() {
  console.log(
    chalk.green(
      figlet.textSync('Node Status', {
        font: 'Ghost',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      })
    )
  );
}

(() => {
  init();

  program
    .command('add')
    .description('Add a new Server')
    .action(handleAdd);

  program
    .command('list')
    .description('List all servers')
    .action(handleList);

  program
    .command('set')
    .description('Modify a server\' s configuration')
    .action(handleModify);

  program
    .command('del')
    .description('Delete a server')
    .action(handleDelete);

  program.parse(process.argv);

})();

