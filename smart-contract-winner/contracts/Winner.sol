// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Winner {
    function callWin(address other) external {
        (bool s, ) = other.call(abi.encodeWithSignature("attempt()"));
        require(s);
    }
}
