const path = require('path');
const assert = require('assert');
const Web3 = require('web3')
const ganache = require('ganache-cli')

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
        await courseList.methods.createCourse(
                "Solidity Course",
                "develop Dapp",
                web3.utils.toWei('8'),
                web3.utils.toWei('2'),
                web3.utils.toWei('4'),
                "hash of picture"
                )
                        .send({
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
    

})