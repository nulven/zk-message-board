// ctrll pagedn pageup
pragma solidity ^0.8.3;
pragma experimental ABIEncoderV2;

contract ContractStorage {
  //////////////
  ///  VARS  ///
  //////////////

  // Should match the number of users in the sig-check contract
  uint256 public constant MAX_USERS = 10;
  uint256 public constant MAX_GROUPS = 10;

  // maps generated message ids to group names
  struct Message {
    uint256 id;
    string text;
    string group;
    bool verified;
  }
  // Maps contiguous confession ids to messages
  Message[] public confessions;

  // maps group names to hash of public keys
  struct Group {
    string name;
    uint256 passwordHash;
    uint256[MAX_USERS] users;
    uint256 userCount;
  }

  // maps names to consecutive group IDs < groupCount
  mapping(string => uint256) public groupIDs;

  // maps each of the groupCount groups to the info
  Group[MAX_GROUPS] public groups;
  mapping(string => bool) public groupExists;

  // We have already assigned groups [0, 1...groupCount)
  // We next assign the incoming group to groupCount
  // Note that we dont need id's anymore since its sequential
  uint256 public groupCount = 1;

  uint256 public pfsVerified;
}
