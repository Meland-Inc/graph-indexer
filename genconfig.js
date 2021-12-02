const fs = require('fs');
const path = require('path');

const v1 = process.argv[2];

const sourcePath = path.join(__dirname, v1);
const targetPath = path.join(__dirname, 'src', 'config.ts');

const buffer = fs.readFileSync(sourcePath);
const confs = JSON.parse(buffer.toString());


fs.writeFileSync(targetPath, `${Object.keys(confs).map(k => {
return `export const ${k} = "${confs[k]}";`;}).join("\n")}
`);