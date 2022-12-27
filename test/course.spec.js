const path = require('path');
const assert = require('assert');
const Web3 = require('web3')
const ganache = require('ganache-cli')
const BigNumber = require('bignumber.js')


const web3 = new Web3(ganache.provider())
const CourseList = require(path.resolve(__dirname, "../src/compiled/CourseList.json"))
const Course = require(path.resolve(__dirname, "../src/compiled/Course.json"))

let accounts
let courseList
let course

describe('测试课程的智能合约',() =>{
    before(async () =>{
        accounts = await web3.eth.getAccounts()
        // console.log(accounts)
        courseList = await new web3.eth.Contract(JSON.parse(CourseList.interface))
                    .deploy({data:CourseList.bytecode})
                    .send({
                        from:accounts[9],
                        gas:"5000000"
                    })
    })
    it('合约部署成功',() => {
        assert.ok(courseList.options.address)
    })
    it('测试添加课程', async()=>{
        const oldAddress = await courseList.methods.getCourse().call()  
        assert.equal(oldAddress.length, 0)
        const newOwner = await courseList.methods.createCourse(
                "Solidity Course",
                "develop Dapp",
                web3.utils.toWei('8'),
                web3.utils.toWei('2'),
                web3.utils.toWei('4'),
                "hash of picture"
                ).send({
                            from:accounts[0],
                            gas:"5000000"
                        })
        const address = await courseList.methods.getCourse().call()  
        assert.equal(address.length, 1)
    })
    it('添加课程', async()=>{
        const [address] = await courseList.methods.getCourse().call()  
        course = await new web3.eth.Contract(JSON.parse(Course.interface), address)
        const name = await course.methods.name().call()
        const content = await course.methods.content().call()
        const target = await course.methods.target().call()
        const fundingPrice = await course.methods.fundingPrice().call()
        const price = await course.methods.price().call()
        const img = await course.methods.img().call()
        const video = await course.methods.video().call()
        const count = await course.methods.count().call()
        const isOnline = await course.methods.isOnline().call() 
        assert.equal(name, "Solidity Course")
        assert.equal(content, "develop Dapp")
        assert.equal(target, web3.utils.toWei('8'),)
        assert.equal(fundingPrice, web3.utils.toWei('2'),)
        assert.equal(price, web3.utils.toWei('4'),)
        assert.equal(img, "hash of picture")
        assert.ok(!isOnline)
        assert.equal(count, 0)
        
    })
    it('删除功能', async()=>{
        await courseList.methods.createCourse(
            "Solidity Course123",
            "develop Dapp",
            web3.utils.toWei('8'),
            web3.utils.toWei('2'),
            web3.utils.toWei('4'),
            "hash of picture"
        )
                        .send({
                            from:accounts[9],
                            gas:"5000000"
                        })
        const address = await courseList.methods.getCourse().call()  
        assert.equal(address.length, 2)
        // 测试只有ceo可以删除
        try{
            await courseList.methods.removeCourse(0)
                .send({
                    from:accounts[9],
                })
            // assert.ok(false)
            
        // 测试不能删除超过列表范围的元素
        const address1 = await courseList.methods.getCourse().call()
        assert.equal(address1.length,  1)
        } catch(e) {
            console.log(e.name)
        }
    })
    it('判断是不是CEO', async()=>{
        const isCeo1 = await courseList.methods.isCeo().call({
            from: accounts[9]
        });
        assert.ok(isCeo1);
        const isCeo2 = await courseList.methods.isCeo().call({
            from: accounts[8]
        });
        assert.ok(!isCeo2);
    })
    it('金钱转换', async()=>{
        assert.equal(web3.utils.toWei('2'),'2000000000000000000');
    })
    it('课程购买', async()=>{
        await course.methods.buy().send({
            from: accounts[2],
            value: web3.utils.toWei('2')
        })
        const value = await course.methods.users(accounts[2]).call();
        const count = await course.methods.count().call(); 
        assert.equal(1, count);
        assert.equal(web3.utils.toWei('2'),value);
        const detail = await course.methods.getDetail().call({from:accounts[0]});
        assert.equal(detail[9], '0');
        const detail2 = await course.methods.getDetail().call({from:accounts[2]});
        assert.equal(detail2[9], '1');
        const detail3 = await course.methods.getDetail().call({from:accounts[3]});
        assert.equal(detail3[9], '2');
    })
    it('上线前作者收不到钱', async()=>{
        // const isonline1 = await course.methods.isOnline().call()
        // console.log(isonline1)
        const oldBalance = new BigNumber(await web3.eth.getBalance(accounts[9]));
        await course.methods.buy().send({
            from: accounts[3],
            value: web3.utils.toWei('2')
        })
        const newBalance = new BigNumber(await web3.eth.getBalance(accounts[9]));
        const diff = newBalance.minus(oldBalance)
        assert.equal(diff, 0)
        
    })
    
    it('上线前不能上传视频', async()=>{
        try {
            await course.methods.addVideo('hash of the our video')
                .send({
                    from: accounts[0],
                    gas: '5000000'
                })
            assert.ok(false)
        } catch(e) {
            assert.equal(e.name, 'c')
        }
    })

    it('价格必须是众筹价格', async()=>{
        try {
            await course.methods.buy().send({
                from: accounts[5],
                value: web3.utils.toWei('1')
            })
            assert.ok(false)
        } catch(e) {
            assert.equal(e.name, 'c')
        }
    })

    it('不能重复购买', async()=>{
        try {
            await course.methods.buy().send({
                from: accounts[2],
                value: web3.utils.toWei('2')
            })
            assert.ok(false)
        } catch(e) {
            assert.equal(e.name, 'c')
        }
    })

    it('众筹结束后钱到账', async()=>{
        await course.methods.buy().send({
            from: accounts[4],
            value: web3.utils.toWei('2')
        })
        const oldBalance = new BigNumber(await web3.eth.getBalance(accounts[0]));

        await course.methods.buy().send({
            from: accounts[5],
            value: web3.utils.toWei('2')
        })
        const newBalance = new BigNumber(await web3.eth.getBalance(accounts[0]));
        const diff = newBalance.minus(oldBalance)
        assert.equal(diff, web3.utils.toWei('8'))
        const count2 = await course.methods.count().call() 
        assert.equal(count2, 4)
        const isOnline2 = await course.methods.isOnline().call() 
        assert.ok(isOnline2)
    })

    it('课程必须是线上价格', async()=>{
        try {
            await course.methods.buy().send({
                from: accounts[6],
                value: web3.utils.toWei('2')
            })
            assert.ok(false)
        } catch(e) {
            assert.equal(e.name, 'c')
        }
        await course.methods.buy().send({
            from: accounts[6],
            value: web3.utils.toWei('4')
        })
        const count = await course.methods.count().call() 
        assert.equal(count, 5)
    })

    it('上线之后有分成', async()=>{
        const oldBalance = new BigNumber(await web3.eth.getBalance(accounts[0]));
        const oldBalanceCEO = new BigNumber(await web3.eth.getBalance(accounts[9]));
        await course.methods.buy().send({
            from: accounts[7],
            value: web3.utils.toWei('4')
        })
        const newBalance = new BigNumber(await web3.eth.getBalance(accounts[0]));
        const newBalanceCEO = new BigNumber(await web3.eth.getBalance(accounts[9]));

        const diff = newBalance.minus(oldBalance)
        const diff2 = newBalanceCEO.minus(oldBalanceCEO)
        assert.equal(diff, web3.utils.toWei('3.6'))
        assert.equal(diff2, web3.utils.toWei('0.4'))
    })

    it('上线后可以上传视频', async()=>{
        await course.methods.addVideo('hash of the our video')
            .send({
                from: accounts[0],
                gas: '5000000'
            })
        const video = await course.methods.video().call()
        assert.equal(video, 'hash of the our video')
    })
})