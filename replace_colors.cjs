const fs = require('fs');
const path = require('path');

function replaceInLine(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/#15803d/ig, '#422A14');
  fs.writeFileSync(filePath, content, 'utf8');
}

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

walkSync('src', filePath => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    replaceInLine(filePath);
  }
});
