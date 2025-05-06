// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

contract BatchTracking {
    struct Batch {
        bytes32 batchId;
        bytes32 spectralHash;
        uint256 timestamp;
        address manufacturer;
        string location;
    }

    mapping(bytes32 => Batch) public batches;
    address[] public validators;

    event BatchRegistered(
        bytes32 indexed batchId,
        address indexed manufacturer,
        uint256 timestamp
    );

    modifier onlyValidator() {
        require(isValidator(msg.sender), "Unauthorized validator");
        _;
    }

    constructor(address[] memory initialValidators) {
        validators = initialValidators;
    }

    function registerBatch(
        bytes32 batchId,
        bytes32 spectralHash,
        string memory location
    ) external onlyValidator {
        require(batches[batchId].timestamp == 0, "Batch already exists");
        
        batches[batchId] = Batch({
            batchId: batchId,
            spectralHash: spectralHash,
            timestamp: block.timestamp,
            manufacturer: msg.sender,
            location: location
        });

        emit BatchRegistered(batchId, msg.sender, block.timestamp);
    }

    function verifyBatch(bytes32 batchId) public view returns (
        bytes32 spectralHash,
        uint256 timestamp,
        string memory location
    ) {
        Batch memory batch = batches[batchId];
        require(batch.timestamp != 0, "Batch not found");
        return (
            batch.spectralHash,
            batch.timestamp,
            batch.location
        );
    }

    function isValidator(address account) private view returns (bool) {
        for (uint i = 0; i < validators.length; i++) {
            if (validators[i] == account) {
                return true;
            }
        }
        return false;
    }
}