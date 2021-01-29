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
    string memory message,
    string memory groupName
  ) public returns (bool success) {
    require(
      checkSigCheckProof(proof.p1, proof.p2, proof.p3, input),
      "Proof invalid!"
    );

    // TODO: Assert message and hash are the same
    Message memory newMessage;
    newMessage.text = message;
    confessions[confessionCount] = newMessage;
    confessionCount += 1;
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

  // Proof we can hash to that key, the hashed key,
  // proof we can hash to that password, the hashed
  // password
  function verifyAndStoreRegistration(
    Proof memory keyHashProof,
    uint256 hashedKey,
    Proof memory passwordHashProof,
    uint256 hashedPass,
    string memory groupName
  ) public returns (bool success) {
    require(hashedKey == groups[groupIDs[groupName]].passwordHash);
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
    addUserToGroup(groupName, hashedKey);
    return true;
  }

  // GETTERS AND SETTERS

  // SETTERS
  function createGroup(string memory groupName, uint256 passwordHash) public {
    // Make new group
    require(!groupExists[groupName]);
    Group memory newGroup;
    newGroup.passwordHash = passwordHash;

    // Assign the group an ID and make it exist
    // Then increment the number of groups
    groupIDs[groupName] = groupCount;
    groupExists[groupName] = true;
    groups[groupCount] = newGroup;
    groupCount += 1;
  }

  function addUserToGroup(string memory groupName, uint256 userHash)
    public
    returns (Group[] memory groups)
  {
    uint256 groupID = groupIDs[groupName];
    uint256 userCount = groups[groupID].userCount;
    require(userCount < MAX_USERS);

    groups[groupID].users[userCount] = userHash;
    userCount++;
  }

  // GETTERS

  function getConfessions() public pure returns (Message[] memory messages) {
    return confessions;
  }

  function getGroups() public pure returns (Group[] memory groups) {
    return groups;
  }
}
