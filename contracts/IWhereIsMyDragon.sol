// SPDX-License-Identifier: MIT

pragma solidity ^0.7.4;

import "./util/IERC1155Receiver.sol";

interface IWhereIsMyDragon is IERC1155Receiver {
    function opt() external view returns(address);

    function get() external;
}