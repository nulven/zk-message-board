export function saveGroup(group: string, publicKey: any, privateKey: BigInt): void {
  localStorage.setItem(`${name}_publicKey`, publicKey);
  localStorage.setItem(`${name}_privateKey`, privateKey.toString());
  const groups = localStorage.getItem(`groups`).split(',');
  const newGroups = [...groups, group];
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
  }
}
