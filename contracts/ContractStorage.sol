// ctrll pagedn pageup
pragma solidity 0.7.6; // >=0.5.16 <=
pragma experimental ABIEncoderV2;

contract ContractStorage {
  //////////////
  ///  VARS  ///
  //////////////
  mapping(bytes32 => bool) public hashIsVerified; // public auto assigns a getter
  mapping(string => uint256[]) public registeredHashes; // public auto assigns a getter
  uint256 public pfsVerified;
}
