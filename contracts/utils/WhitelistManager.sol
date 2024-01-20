// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.16;

import {Roles} from "./Roles.sol";

contract WhitelistManager {
    using Roles for Roles.Role;

    Roles.Role private _owners;
    Roles.Role private _poolManagers;
    Roles.Role private _fundManagers;
    Roles.Role private _verifiers;
    Roles.Role private _whitelisted;
    Roles.Role private _hr;

    constructor() {
        _owners.add(msg.sender);    
        _hr.add(msg.sender);
        _fundManagers.add(msg.sender);
        _poolManagers.add(msg.sender);
        _verifiers.add(msg.sender);
        _whitelisted.add(msg.sender);
    }

    /**
     * @dev Modifier for only HR calling
     */
    modifier onlyHr() {
        require(_hr.has(msg.sender), "DOES_NOT_HAVE_HR_ROLE");
        _;
    }

    /**
     * @dev Modifier for only owner calling
     */
    modifier onlyOwners() {
        require(_owners.has(msg.sender), "DOES_NOT_HAVE_OWNER_ROLE");
        _;
    }

    /**
     * @dev Modifier for only pool manager calling
     */
    modifier onlyPoolManagers() {
        require(
            _poolManagers.has(msg.sender),
            "DOES_NOT_HAVE_POOL_MANAGER_ROLE"
        );
        _;
    }
    /**
     * @dev Modifier for only fund manager calling
     */
    modifier onlyFundManagers() {
        require(
            _fundManagers.has(msg.sender),
            "DOES_NOT_HAVE_FUND_MANAGER_ROLE"
        );
        _;
    }

    /**
     * @dev Modifier for only verifier calling
     */

    modifier onlyVerifiers() {
        require(_verifiers.has(msg.sender), "DOES_NOT_HAVE_VERIFIER_ROLE");
        _;
    }

    /**
     * @dev To check whether the address is whitelisted or not
     */
    function isWhitelisted(address _address) external view returns (bool) {
        return _whitelisted.has(_address);
    }

    /**
     * @dev To check whether the address is FundManger or not
     */
    function isFundManager(address _address) external view returns (bool) {
        return _fundManagers.has(_address);
    }

    /**
     * @dev To check whether the address is PoolManager or not
     */
    function isPoolManager(address _address) external view returns (bool) {
        return _poolManagers.has(_address);
    }

    /**
     * @dev To check whether the address is Verified or not
     */
    function isVerifier(address _address) external view returns (bool) {
        return _verifiers.has(_address);
    }

     /**
     * @dev To check whether the address is Owner or not
     */
    function isOwner(address _address) external view returns (bool) {
        return _owners.has(_address);
    }
    /**
     * @dev To check whether the address is HR or not
     */
    function isHr(address _address) external view returns (bool) {
        return _hr.has(_address);
    }

    /**
        HR Utils Functions Executed by Owner
    */

    /**
     * @dev To add an address to HR role
     */
    function addHr(address _address) public onlyOwners {
        _hr.add(_address);
    }

    /**
     * @dev To remove an address from HR role
     */
    function removeHr(address _address) public onlyOwners {
        _hr.remove(_address);
    }

    /**
        Verifier Utils Functions Executed by HR
    */

    /**
     * @dev To add an address to verifier role
     */
    function addVerifier(address _address) public onlyHr {
        _verifiers.add(_address);
    }

    /**
     * @dev To remove an address from verifier role
     */
    function removeVerifier(address _address) public onlyHr {
        _verifiers.remove(_address);
    }

    /**
        FundManger Utils Functions Executed by HR
    */

    /**
     * @dev To add an address to PoolManager role
     */
    function addPoolManager(address _address) public onlyHr {
        _poolManagers.add(_address);
    }

    /**
     * @dev To remove an address from PoolManager role
     */
    function removePoolManager(address _address) public onlyHr {
        _poolManagers.remove(_address);
    }

    /**
        FundManger Utils Functions Executed by HR
    */

    /**
     * @dev To add an address to FundManager role
     */
    function addFundManager(address _address) public onlyHr {
        _fundManagers.add(_address);
    }

    /**
     * @dev To remove an address from FundManager role
     */
    function removeFundManager(address _address) public onlyHr {
        _fundManagers.remove(_address);
    }

    /**
        Whitelist Utils Functions Executed by Verifiers
    */

    /**
     * @dev To add a single address to whitelist
     */
    function addWhitelist(address _address) public onlyVerifiers {
        _whitelisted.add(_address);
    }

    /**
     * @dev To remove an address from whitelist
     */
    function removeWhitelist(address _address) public onlyVerifiers {
        _whitelisted.remove(_address);
    }
}
