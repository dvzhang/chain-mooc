1. Truffle 相当于create-react-app或者vue-cli
2. 一开始用没有问题，但是想要进阶需要自己配置webpack

1. 使用js测试合约，测试驱动开发
2. 需要外部掉哟过，函数类型为public
3. [solc](https://github.com/ethereum/solc-js)
    solc编译solw文件，生成一个json，后面部署 测试等需要的数据
    1 bytecode: 部署合约用的代码
        部署合约用的数据
    2 interface 接口声明
        测试使用

每次compile清空文件，重新生成
报错信息打印
监听，自动compile:onchange模块


课程列表
    每一个课程是一个单独的合约
    使用course list来控制课程的合约


测试 
    使用mocha
    断言使用node自己的assert
    本地部署环境，ganache-cli 测试虚拟环境