// ctrll pagedn pageup
pragma solidity 0.7.6; // >=0.5.16 <=
pragma experimental ABIEncoderV2;
import "./SigCheckVerifier.sol";
import "./HashVerifier.sol";
import "./ContractStorage.sol";
import "./Pairing.sol";

// Validates messages and registrations
contract CoreValidator is ContractStorage {
  //////////////
  ///  TYPES ///
  //////////////
  //   struct Proof {
  //     Pairing.G1Point A;
  //     Pairing.G2Point B;
  //     Pairing.G1Point C;
  //   }
  struct Proof {
    uint256[2] p1;
    uint256[2][2] p2;
    uint256[2] p3;
  }
  //////////////
  /// EVENTS ///
  //////////////

  event ProofVerified(uint256 pfsAccepted); // Question: use an event or an internal mapping?

  ////////////////
  /// Messages  //
  ////////////////
  function checkSigCheckProof(
    uint256[2] memory _a,
    uint256[2][2] memory _b,
    uint256[2] memory _c,
    uint256[825] memory _input
  ) public returns (bool success) {
    // SigCheckVerifier verifier = new SigCheckVerifier();
    require(
      SigCheckVerifier.verifyProof(_a, _b, _c, _input),
      "Failed init proof check"
    );
    pfsVerified += 1;
    emit ProofVerified(pfsVerified);
    return true;
  }

  function verifyAndAddMessage(
    Proof memory proof,
    uint256[825] memory input,
    string memory message
  ) public returns (bool success) {
    require(
      checkSigCheckProof(proof.p1, proof.p2, proof.p3, input),
      "Proof invalid!"
    );
    hashIsVerified[keccak256(abi.encode(message))] = true;
    return true;
  }

  ///////////////////
  /// Registration //
  ///////////////////
  function checkHashProof(
    uint256[2] memory _a,
    uint256[2][2] memory _b,
    uint256[2] memory _c,
    uint256[2] memory _input
  ) public returns (bool success) {
    // HashVerifier verifier = new HashVerifier();
    require(
      HashVerifier.verifyProof(_a, _b, _c, _input),
      "Failed init proof check"
    );
    pfsVerified += 1;
    emit ProofVerified(pfsVerified);
    return true;
  }

  function verifyAndStoreRegistration(
    Proof memory keyHashProof,
    Proof memory passwordHashProof,
    uint256 hashedKey,
    uint256 hashedPass,
    string memory pollName
  ) public returns (bool success) {
    require(
      checkHashProof(
        passwordHashProof.p1,
        passwordHashProof.p2,
        passwordHashProof.p3,
        [hashedPass, hashedPass]
      ),
      "Password proof invalid!"
    );
    require(
      checkHashProof(
        keyHashProof.p1,
        keyHashProof.p2,
        keyHashProof.p3,
        [hashedKey, hashedKey]
      ),
      "Key proof invalid!"
    );
    registeredHashes[pollName].push(hashedKey);
    return true;
  }
}
