pragma solidity >0.4.20;
// pragma solidity >=0.7.0 <0.9.0;

contract CourseList{
    address public ceo;
    address[] public courses;

    constructor () public {
        ceo = msg.sender;
    }

    function createCourse(string memory _name) public {
        address newCourse = new Course(_name);
        courses.push(newCourse);
    }
    function getCourse() public view returns(address [] memory){
        return courses;
    }
    function removeCourse(uint _index) public{
        // 只有 ceo能删除
        require(msg.sender == ceo);
        // 根据索引进行删除
        require((_index < courses.length));
        uint len = courses.length;
        for (uint i = _index; i < len-1; i++){
            courses[i] = courses[i+1];
        }
        delete courses[len-1];
        courses.length --; 
    }
}


contract Course{
    string public name;
    constructor (string memory _name) public {
        name = _name;
    }
}