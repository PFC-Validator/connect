export const getShortAddress = (address: string | undefined) => {
  if (address) {
    return address.slice(0, 8).concat(".....") + address.substring(40);
  }
  return "???????";
};
