// 部署合约到测试网络

const path = require('path')
const Web3 = require('web3')
const HdWalletProvider = require('truffle-hdwallet-provider')

const contractPath = path.resolve(__dirname, '../src/compiled/CourseList.json')
const {interface, bytecode} = require(contractPath)

require('dotenv').config();
const mnemonic = process.env.MNEMONIC;
const infuraId = process.env.INFURA_ID
// const contractAddress = process.env.CONTRACT_ADDRESS

const provider = new HdWalletProvider(
    mnemonic,
    // "https://sepolia.infura.io/v3/" + infuraId
    'https://goerli.infura.io/v3/' + infuraId
    // "https://mainnet.infura.io/v3/" + infuraId
)

const web3 = new Web3(provider);

(async()=>{
    console.log('自执行')
    const accounts = await web3.eth.getAccounts()
    // console.log(accounts.length)
    console.log(web3.eth.getBalance(accounts[0]))

    // for(i=1; i<accounts.length; i++){
    //     console.log(accounts[i])
    // }
    console.log('合约部署的账号：', accounts)
    // await
    console.time('合约部署消耗时间')
    console.log("done")
    const result = await new web3.eth.Contract(JSON.parse(interface))
                      .deploy({data: bytecode})
                      .send({
                        from:accounts[0],
                        gas:'30000000'
                      })
                      .on("error", function (error) {
                        console.log("error", error);
                      })
    console.log("done")

    console.timeEnd('合约部署消耗时间')
    const contractAddress = result.options.address
    console.log('合约部署成功', contractAddress)
})()



// var provider = new HDWalletProvider(mnemonic, "http://localhost:8545");

// // Or, alternatively pass in a zero-based address index.
// var provider = new HDWalletProvider(mnemonic, "http://localhost:8545", 5);

// // Or, use your own hierarchical derivation path
// var provider = new HDWalletProvider(mnemonic, "http://localhost:8545", 5, 1, "m/44'/137'/0'/0/");

// ...
// Write your code here.
// ...

// At termination, `provider.engine.stop()' should be called to finish the process elegantly.
provider.engine.stop();