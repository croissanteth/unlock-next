export const providers: Record<string, string> = {
  "1": "",
  "4": "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  "100": "https://rpc.xdaichain.com/",
  "10": "",
};

export const paywallConfig: Record<string, unknown> = {
  locks: {
    "0x4B464E559Ce469313e5a6E1fD92F351c098Ef164": {
      network: 4,
    },
  },
  pessimistic: true,
};
