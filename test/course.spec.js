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
        await courseList.methods.createCourse("Solidity Course")
                        .send({
                            from:accounts[0],
                            gas:"5000000"
                        })
        const address = await courseList.methods.getCourse().call()  
        assert.equal(address.length, 1)
    })
    it('添加课程的名字', async()=>{
        const [address] = await courseList.methods.getCourse().call()  
        course = await new web3.eth.Contract(JSON.parse(Course.interface), address)
        const name = await course.methods.name().call()
        assert.equal(name, "Solidity Course")
    })
    it('删除功能', async()=>{
         

        await courseList.methods.createCourse("Solidity Course123")
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

})