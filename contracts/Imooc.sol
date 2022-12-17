pragma solidity ^0.8.7;
// pragma solidity >=0.7.0 <0.9.0;

contract CourseList{
    address public ceo;
    constructor () public {
        ceo = msg.sender;

    }
}