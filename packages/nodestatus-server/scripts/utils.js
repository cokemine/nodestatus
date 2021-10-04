const fs = require('fs');

function backupDatabase(dbPath) {
  console.log('The database file is detected to already exist.');
  console.log('Trying to update database schema.....');
  const date = new Date();
  fs.copyFileSync(
    dbPath,
    `${dbPath}_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}.bak`
  );
}

module.exports = { backupDatabase };
