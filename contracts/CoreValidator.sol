// ctrll pagedn pageup
pragma solidity ^0.8.3;
pragma experimental ABIEncoderV2;
import "./Verifier.sol";
import "./ContractStorage.sol";

// Validates messages and registrations
contract CoreValidator is ContractStorage {
  //////////////
  /// EVENTS ///
  //////////////

  event ProofVerified(uint256 pfsAccepted); // Question: use an event or an internal mapping?
  
  uint256 confessionCount;

  constructor() public {
    confessionCount = 0;
  }

  ////////////////
  /// Messages  //
  ////////////////
  function verifyAndAddMessage(
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c,
    uint256[14] memory input,
    string memory message,
    string memory groupName
  ) public returns (bool) {
    require(Verifier.verifySigCheckProof(a, b, c, input), "Proof invalid!");
    pfsVerified += 1;
    emit ProofVerified(pfsVerified);

    // TODO: Assert message and hash are the same
    createMessage(message, groupName);
    return true;
  }

  ///////////////////
  /// Registration //
  ///////////////////
  // Proof we can hash to that key, the hashed key,
  // proof we can hash to that password, the hashed
  // password
  function verifyAndStoreRegistration(
    uint256[2] memory keyA,
    uint256[2][2] memory keyB,
    uint256[2] memory keyC,
    uint256[1] memory keyInput,
    uint256[2] memory passwordA,
    uint256[2][2] memory passwordB,
    uint256[2] memory passwordC,
    uint256[2] memory passwordInput,
    string memory groupName
  ) public returns (bool) {
    require(
      passwordInput[0] == groups[groupIDs[groupName]].passwordHash,
      "Wrong pass hash!"
    );
    require(
      Verifier.verifyHashCheckBitsProof(keyA, keyB, keyC, keyInput),
      "Key proof invalid!"
    );
    require(
      Verifier.verifyHashCheckProof(
        passwordA,
        passwordB,
        passwordC,
        passwordInput
      ),
      "Password proof invalid!"
    );
    addUserToGroup(groupName, keyInput[0]);
    pfsVerified += 1;
    emit ProofVerified(pfsVerified);
    return true;
  }

  // GETTERS AND SETTERS

  // SETTERS
  function createGroup(string memory groupName, uint256 passwordHash) public {
    // Make new group
    require(!groupExists[groupName], "Group already exists!");
    require(groupCount < MAX_GROUPS, "Too many groups!");
    Group memory newGroup;
    newGroup.passwordHash = passwordHash;
    newGroup.name = groupName;
    newGroup.userCount = 0;

    // Assign the group an ID and make it exist
    // Then increment the number of groups
    groupIDs[groupName] = groupCount;
    groupExists[groupName] = true;
    groups[groupCount] = newGroup;
    groupCount += 1;
  }

  function addUserToGroup(string memory groupName, uint256 userHash) public {
    uint256 groupID = groupIDs[groupName];
    uint256 userCount = groups[groupID].userCount;
    require(userCount < MAX_USERS, "Too many users!");

    groups[groupID].users[userCount] = userHash;
    groups[groupID].userCount++;
  }

  // TODO: make private
  function createMessage(string memory message, string memory groupName)
    public
  {
    Message memory _message;
    _message.id = confessionCount;
    _message.text = message;
    _message.group = groupName;
    _message.verified = false;
    confessions.push(_message);
    confessionCount += 1;
  }

  // GETTERS
  function getAllHashedUsersByGroupID(uint256 groupID)
    public
    view
    returns (uint256[MAX_USERS] memory)
  {
    require(groupCount > groupID, "Not enough groups!");
    return groups[groupID].users;
  }

  function getAllHashedUsersByGroupName(string memory groupName)
    public
    view
    returns (uint256[MAX_USERS] memory)
  {
    return getAllHashedUsersByGroupID(groupIDs[groupName]);
  }

  function getConfessions()
    public
    view
    returns (Message[] memory)
  {
    uint256 count = confessionCount;
    Message[] memory _confessions = new Message[](count);
    for (uint256 i = 0; i < count; i++) {
      _confessions[i] = confessions[i];
    }
    return _confessions;
  }

  function getConfessionByID(uint256 confessionID)
    public
    view
    returns (Message memory)
  {
    require(confessionCount > confessionID, "Not enough confessions!");
    return confessions[confessionID];
  }

  function getGroups() public view returns (Group[MAX_GROUPS] memory) {
    return groups;
  }

  function getGroupByID(uint256 groupID) public view returns (Group memory) {
    require(groupCount > groupID, "Not enough groups!");
    return groups[groupID];
  }
}
