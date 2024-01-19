// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.16;

interface IWhitelistManager {
    function isWhitelisted(address _address) external view returns (bool);
    function isFundManager(address _address) external view returns (bool);
    function isPoolManager(address _address) external view returns (bool);
    function isVerifier(address _address) external view returns (bool);
    function isHr(address _address) external view returns (bool);
    function isOwner(address _address) external view returns (bool);
}
