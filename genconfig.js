const fs = require('fs');
const path = require('path');

const v1 = process.argv[2];

const sourcePath = path.join(__dirname, v1);
const targetPath = path.join(__dirname, 'src', 'config.ts');

const buffer = fs.readFileSync(sourcePath);
const confs = JSON.parse(buffer.toString());


fs.writeFileSync(targetPath, `${Object.keys(confs).map(k => {
    return `export const ${k} = "${confs[k]}".toLowerCase();`;
}).join("\n")}
export function getAll(): Map<string, string>  {
    let map = new Map<string, string>();
    ${Object.keys(confs).map(k => {
    return `map.set("${k}", ${k});`;
}).join("\n")
    }
    return map;
}
export function getAllKeys(): string[] {
    return [
        ${Object.keys(confs).map(k => {
        return `"${k}"`;
    }).join(",\n")
    }
    ];
}
`);