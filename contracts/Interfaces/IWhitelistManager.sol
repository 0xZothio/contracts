// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

interface IWhitelistManager {
    function isWhitelisted(address _address) external view returns (bool);
}
