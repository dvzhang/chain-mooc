pragma solidity >0.4.20;
// pragma solidity >=0.7.0 <0.9.0;

contract CourseList{
    address public ceo;
    address[] public courses;

    constructor () public {
        ceo = msg.sender;
    }

    function createCourse(string memory _name, string memory _content, uint _target, uint _fundingPrice, uint _price, string memory _img) public returns(address){
        address newCourse = new Course(ceo, msg.sender, _name, _content, _target, _fundingPrice, _price, _img);
        courses.push(newCourse);
        return msg.sender;
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

    function isCeo() public view returns(bool){
        return msg.sender == ceo;
    }
}


contract Course{
    address public ceo;
    string public name;
    address public owner;
    string public content;
    uint public target;
    uint public fundingPrice;
    uint public price;
    string public img;
    string public video;
    bool public isOnline;
    uint public count;
    mapping(address => uint) public users;

    constructor (address _ceo, address _owner, string memory _name, string memory _content, uint _target, uint _fundingPrice, uint _price, string memory _img) public {
        name = _name;
        owner = _owner;
        content = _content;
        target = _target;
        fundingPrice = _fundingPrice;
        price = _price;
        img = _img;
        video = '';
        isOnline = false;
        count = 0;
        ceo = _ceo;
    }

    function buy() public payable {
        // 1. user did not buy it
        require(users[msg.sender] == 0);
        if(isOnline){
            require(price == msg.value);
        } else {
            require(fundingPrice == msg.value);
        }
        users[msg.sender] = msg.value;
        count += 1;

        // 2. 如果收到的钱大于目标，上线
        if (target <= count*fundingPrice){
            if(isOnline){
                uint value = msg.value;
                ceo.transfer(value / 10);
                owner.transfer(value - value/10);
            } else {
                isOnline = true;
                // 上线前的钱，应该在合约内部，众筹成功直接转
                owner.transfer(count*fundingPrice);
            }
        }
        // 3. 上线前的钱ceo不拿

        // 4.上线后的钱ceo拿1成
    }

    function getDetail() public view returns(string, string, uint, uint ,uint, string, string, uint, bool, uint){
        uint role;
        if (msg.sender == owner){

            role = 0;
        } else if (users[msg.sender] > 0) {
            role = 1;
        } else {
            role = 2;
        }

        return (
            name,
            content,
            target,
            fundingPrice,
            price,
            img,
            video,
            count,
            isOnline,
            role
        );

    }

    function addVideo(string _video) public {
        require(msg.sender == owner);
        require(isOnline == true);
        video = _video;
    }
}
