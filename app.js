const path = require('path');
const fs = require('fs');
const FileList = require('./FileList');
const configPath = 'setting.json';
let config;
let backupFlag = false;
let backupFiles;
let backupDirs;

/** 設定ファイルの読み込み(JSON) */
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch(e) {
  console.log(e);
  process.exit(-1);
}

/** バックアップ用のディレクトリ名を設定ファイルから取得 */
const bkDirName = config.general.backupDirName;

/** 設定ファイルに記載されている拡張子を元にファイル一覧を取得 */
const fl = new FileList(config.general.path);
const files = fl.getFilesByExtNames(config.general.targetExtNames);

/** バックアップ用のディレクトリを作成 */
if(config.general.backupDirName) {
  backupFiles = files.map(x=>x.replace(path.resolve('.') + path.sep, ''));
  backupDirs = [bkDirName, ...new Set(backupFiles.map(x=>path.join(bkDirName, x.replace(path.sep + path.basename(x), ''))))];
  backupDirs.forEach(x=>!fs.existsSync(x) && fs.mkdirSync(x, {recursive: true}));
  backupFlag = true;
}

files.forEach((x,i)=>{
  /** 元となるファイルを読み込み */
  let data = fs.readFileSync(x, 'utf8');

  /** バックアップを作成 */
  backupFlag && fs.writeFileSync(path.resolve(bkDirName, backupFiles[i]), data);

  /** コメントを削除 */
  if(config.general.eraseComment) {
    data = data.replace(/\s?<\!--[^\[][\s\S]*?-->/g, "");
  }

  /** 指定の文章を置換 */
  for(rep in config.general.replaces) {
    data = data.replace(new RegExp(rep.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&'), 'g'), config.general.replaces[rep]);
  }

  /** ファイルを書き込み */
  fs.writeFileSync(x, data, err=>{console.log(err)});
});

