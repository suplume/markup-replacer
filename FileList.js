const path = require('path');
const fs = require('fs');

class FileList {
  constructor(target) {
    this._target = target;
  }
  getFilesByExtNames(extnames) {
    const result = [];
    const absPath = path.resolve(this._target);
    const paths = fs.readdirSync(absPath);
    let dirs = [];

    paths.forEach(function f(x) {
      const current = path.join(absPath, ...dirs, x);
      switch(true) {
        case fs.statSync(current).isFile():
          if(extnames.some(y=>path.extname(current).includes(y))) {
            result.push(current);
          }
          break;
        case fs.statSync(current).isDirectory():
          const cp = path.basename(current);
          dirs.push(cp);
          fs.readdirSync(current).forEach(f);
          dirs = dirs.filter(y=>y!==cp);
          break;
        default:
          console.log(current + " is unknown type.");
          break;
      }
    });
    return result;
  }
}

module.exports = FileList;
