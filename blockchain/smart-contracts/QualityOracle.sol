// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract QualityOracle {
    struct QualityStandard {
        uint minPurity;
        uint maxImpurity;
        uint requiredTests;
        bool gmpCertified;
    }
    
    mapping(bytes32 => QualityStandard) public standards;
    address public regulator;
    
    event StandardUpdated(
        bytes32 indexed drugCode,
        uint newMinPurity,
        uint timestamp
    );
    
    constructor(address _regulator) {
        regulator = _regulator;
    }

    function updateQualityStandard(
        bytes32 drugCode,
        uint minPurity,
        uint maxImpurity,
        uint requiredTests,
        bool gmpCertified
    ) external {
        require(msg.sender == regulator, "Only regulator can update standards");
        
        standards[drugCode] = QualityStandard({
            minPurity: minPurity,
            maxImpurity: maxImpurity,
            requiredTests: requiredTests,
            gmpCertified: gmpCertified
        });
        
        emit StandardUpdated(drugCode, minPurity, block.timestamp);
    }

    function verifyGMPCompliance(
        bytes32 batchId,
        bytes32 drugCode,
        uint actualPurity,
        uint impurityLevel
    ) external view returns (bool) {
        QualityStandard memory standard = standards[drugCode];
        return actualPurity >= standard.minPurity &&
               impurityLevel <= standard.maxImpurity &&
               standard.gmpCertified;
    }
}