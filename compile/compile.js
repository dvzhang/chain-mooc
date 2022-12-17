const fs = require('fs');
const path = require('path');
const solc = require('solc');
const contractPath = path.resolve(__dirname, "../contracts/Imooc.sol")

// 获取合约文件内容
const source = fs.readFileSync(contractPath, "utf-8")
console.log(source);
