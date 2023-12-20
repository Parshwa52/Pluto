// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./Plutoken.sol";
import "./EIP712MetaTransaction.sol";

contract Transactor is EIP712MetaTransaction("Transactor", "1") {
    Plutoken public tokenContract;

    constructor(Plutoken tokenContractAddress) {
        tokenContract = tokenContractAddress;
    }

    function onboard(address recipient, uint value) public payable {
        tokenContract.transfer(recipient, value);
    }
}
