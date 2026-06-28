import cp from 'node:child_process';
/*
*  Prisma 在 https://github.com/prisma/prisma/issues/3834 移除了对多 Provider 的支持。
*  这使得我们需要在每次运行时重新根据 DATABASE_URL 手动修改 schema
*  并重新生成 @prisma/client 来实现修改成正确的 Provider
*  同时重新调用 `prisma db push` 来实现类似于 Sequelize 的 sync 效果 来应对可能的数据库结构变化
*  如果有更好的方案欢迎提出
* */
import fs from 'node:fs';
import { homedir, platform } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import replace from 'replace-in-file';

const __dirname = dirname(fileURLToPath(import.meta.url));

function checkDatabaseType() {
  const dbPath = process.env.DATABASE || '';
  if (dbPath.includes('mysql:')) {
    return 'mysql';
  }
  if (dbPath.includes('postgresql:')) {
    return 'postgresql';
  }
  return 'sqlite';
}

function initDatabase() {
  const databaseType = checkDatabaseType();
  const dbPath = process.env.DATABASE || (
    platform() === 'win32'
      ? `file:${resolve(homedir(), '.nodestatus/db.sqlite')}`
      : 'file:/usr/local/NodeStatus/server/db.sqlite'
  );
  const envOption = { BINARY_TARGETS: '["native"]', ...process.env };

  if (databaseType === 'sqlite') {
    envOption.DATABASE_URL = dbPath.includes('file:') ? dbPath : `file:${dbPath}`;
  }
  else {
    envOption.DATABASE_URL = dbPath;
  }

  /* Replace provider since prisma dropped provider array notation support */
  replace.replaceInFile({
    files: resolve(__dirname, '../prisma/schema.prisma'),
    from: /provider = "\w+"/,
    to: `provider = "${databaseType}"`,
  }).then(() => {
    let cmd = 'prisma';
    let args = ['db', 'push'];

    if (platform() === 'win32') { cmd = 'cmd.exe'; args = ['/c', 'prisma', 'db', 'push']; }

    /* Regenerate correct prisma client */

    const prisma = cp.spawn(cmd, args, {
      env: envOption,
      cwd: resolve(__dirname, '../'),
      stdio: 'inherit',
    });

    prisma.on('close', (code) => {
      if (code) {
        console.log('Something wrong while updating database schema.');
        process.exit(code);
      }
      else {
        try {
          let genCmd = 'prisma';
          let genArgs = ['generate'];
          if (platform() === 'win32') {
            genCmd = 'cmd.exe';
            genArgs = ['/c', 'prisma', 'generate'];
          }
          const genResult = cp.spawnSync(genCmd, genArgs, {
            env: envOption,
            cwd: resolve(__dirname, '../'),
            stdio: 'inherit',
          });
          if (genResult.status) {
            console.log('Something wrong while generating Prisma client.');
            process.exit(genResult.status);
          }
        }
        catch (e) {
          console.error('Failed to run prisma generate:', e);
          process.exit(1);
        }
        console.log(`Database file location: ${dbPath}`);
      }
    });
  });
}

/* Default testing database */
if (process.env.NODE_ENV === 'TEST' && !process.env.DATABASE) {
  const database = resolve(__dirname, '../db.test.sqlite');
  fs.rmSync(database, { force: true });
  process.env.DATABASE = database.replace(/\\/g, '/');
}

if (process.env.NODE_ENV !== 'TEST') {
  dotenv.config({ path: resolve(homedir(), '.nodestatus/.env.local') });
}
initDatabase();
