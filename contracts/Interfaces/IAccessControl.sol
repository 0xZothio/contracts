// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IAccessControl {
    function isWhitelisted(address _address) external view returns (bool);

    function isOwner(address _address) external view returns (bool);
}
