// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Airdrop is Ownable {
    mapping(bytes32 => bool) private claimed;
    bytes32 private merkleRoot;
    IERC20 private immutable token;
    address private constant BAYC_ADDRESS =
        0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D;
    bool private airdropStatus;

    error AddressZeroNotAllowed();
    error OnlyOwnerAllowed();
    error AirdropIsActive();
    error NoTokensToWithdraw();
    error InvalidProof();
    error AirdropIsNotActive();
    error AlreadyClaimed();
    error NotBaycHolder();

    event AirdropStarted();
    event AirdropEnded();
    event Claimed(address indexed user, uint256 indexed amount);

    constructor(
        address _owner,
        address _token,
        bytes32 _merkleRoot
    ) Ownable(_owner) {
        _checkAddressZero(_token);
        _checkAddressZero(_owner);

        token = IERC20(_token);
        merkleRoot = _merkleRoot;
    }

    function _checkAddressZero(address _address) private pure {
        if (_address == address(0)) revert AddressZeroNotAllowed();
    }

    function _withdraw(address _to) private onlyOwner {
        _checkAddressZero(_to);
        if (airdropStatus) revert AirdropIsActive();
        uint256 balance = token.balanceOf(address(this));
        if (balance == 0) revert NoTokensToWithdraw();
        token.transfer(_to, balance);
    }

    function _getLeafHash(
        address _address,
        uint256 _amount
    ) private pure returns (bytes32) {
        return keccak256(abi.encode(_address, _amount));
    }

    function _verifyProof(
        bytes32[] calldata _proof,
        address _address,
        uint256 _amount
    ) private view returns (bool) {
        bytes32 leafHash = _getLeafHash(_address, _amount);
        return MerkleProof.verify(_proof, merkleRoot, leafHash);
    }

    function _checkClaimStatus(
        address _address,
        uint256 _amount
    ) private view returns (bool) {
        bytes32 leafHash = _getLeafHash(_address, _amount);
        return claimed[leafHash];
    }

    function _setClaimStatus(address _address, uint256 _amount) private {
        bytes32 leafHash = _getLeafHash(_address, _amount);
        claimed[leafHash] = true;
    }

    function startAirdrop() external onlyOwner {
        airdropStatus = true;
    }

    function endAirdrop() external onlyOwner {
        airdropStatus = false;
    }

    function claimAirdrop(uint256 _amount, bytes32[] calldata _proof) external {
        if (!airdropStatus) revert AirdropIsNotActive();
        _checkAddressZero(msg.sender);
        if (_checkClaimStatus(msg.sender, _amount)) revert AlreadyClaimed();
        if (!_verifyProof(_proof, msg.sender, _amount)) revert InvalidProof();
        if (IERC721(BAYC_ADDRESS).balanceOf(msg.sender) < 1)
            revert NotBaycHolder();

        _setClaimStatus(msg.sender, _amount);

        token.transfer(msg.sender, _amount);

        emit Claimed(msg.sender, _amount);
    }

    function updateMerkleRoot(bytes32 _root) external onlyOwner {
        merkleRoot = _root;
    }

    function withdrawToOwner() external onlyOwner {
        _withdraw(owner());
    }

    function withdrawToAddress(address _to) external onlyOwner {
        _withdraw(_to);
    }

    function checkClaimStatus(
        address _address,
        uint256 _amount
    ) external view returns (bool) {
        return _checkClaimStatus(_address, _amount);
    }

    function getToken() external view returns (address) {
        return address(token);
    }

    function getMerkleRoot() external view returns (bytes32) {
        return merkleRoot;
    }

    function getStatus() external view returns (bool) {
        return airdropStatus;
    }

    function getBaycAddress() external pure returns (address) {
        return BAYC_ADDRESS;
    }
}
