export function saveGroup(group: any, publicKey: any, privateKey: BigInt): void {
  localStorage.setItem(`${group.name}_publicKey`, publicKey);
  localStorage.setItem(`${group.name}_privateKey`, privateKey.toString());
  const groups = loadGroups();
  const newGroups = [...groups, group.name];
  localStorage.setItem(`groups`,newGroups.toString());
}
  
export function loadGroup(group: string) {
  const publicKeyMaybe = localStorage.getItem(`${group}_publicKey`);
  const privateKeyMaybe = localStorage.getItem(`${group}_privateKey`);
  if (publicKeyMaybe !== null && privateKeyMaybe !== null) {
    if (true) {
      const publicKey = publicKeyMaybe.split(',').map(v => BigInt(v));
      const privateKey = privateKeyMaybe;

      return { publicKey, privateKey };
    } else {
      console.log('Key is not valid');
    }
  } else {
    return { publicKey: null, privateKey: null };
  }
};

export function loadGroups(): string[] {
  const groupsMaybe = localStorage.getItem(`groups`);
  if (groupsMaybe !== null) {
    if (true) {
      return groupsMaybe.split(',');
    } else {
      console.log('You are not a member of any group');
    }
  } else {
    return [];
  }
}
