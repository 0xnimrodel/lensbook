export const getPPUrl = (profile: any) => {
  return profile.picture &&
    profile.picture.original &&
    profile.picture.original.url.includes("lens.infura-ipfs.io")
    ? profile.picture.original.url
    : `https://avatar.tobi.sh/${profile.handle}.png`;
};
