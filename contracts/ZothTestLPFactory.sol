// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.16;
import {ZothPool} from "./V3/ZothPool.sol";
contract ZothTestLPFactory {
     function createPool(address _whitelistManager) external returns(address) {
        ZothPool newPool = new ZothPool(_whitelistManager,msg.sender);
        return address(newPool);
    }
}