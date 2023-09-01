// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.5;

import {Roles} from "./Roles.sol";

contract WhitelistManager {
    using Roles for Roles.Role;

    Roles.Role private _verifiers;
    Roles.Role private _owners;
    Roles.Role private _whitelisted;

    constructor() {
        _owners.add(msg.sender);
        _verifiers.add(msg.sender);
        _whitelisted.add(msg.sender);
    }

    /**
     * @dev Checks the _owners role for the sender
     */
    modifier onlyOwners() {
        require(_owners.has(msg.sender), "DOES_NOT_HAVE_OWNER_ROLE");
        _;
    }
    /**
     * @dev Checks the _verifiers role for the sender
     */
    modifier onlyVerifiers() {
        require(_verifiers.has(msg.sender), "DOES_NOT_HAVE_VERIFIER_ROLE");
        _;
    }

    /**
     * @dev Checks the _verifier or _owner role for the sender
     */
    modifier onlyAuthorities() {
        require(
            _verifiers.has(msg.sender) || _owners.has(msg.sender),
            "ONLY_AUTHORITIES_ARE_ALLOWED_TO_EXECUTE_THIS_FUNC"
        );
        _;
    }

    function whitelistAddress(address _address) public onlyAuthorities {
        _whitelisted.add(_address);
    }

    function addVerifier(address _address) public onlyOwners {
        _verifiers.add(_address);
    }

    function isWhitelisted(address _address) external view returns (bool) {
        return _whitelisted.has(_address);
    }

    function removeWhitelisted(address _address) public {
        _whitelisted.remove(_address);
    }
}
