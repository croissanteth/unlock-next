import { ethers } from "ethers";
import { providers, paywallConfig } from "~/config/unlock";
import type { IronSessionOptions } from "iron-session";
import { User } from "./types";

interface GetHasValidKeyOptions {
  network: number;
  lockAddress: string;
  userAddress: string;
}

export async function getHasValidKey({
  network,
  lockAddress,
  userAddress,
}: GetHasValidKeyOptions) {
  const ABI = [
    {
      constant: true,
      inputs: [{ internalType: "address", name: "_keyOwner", type: "address" }],
      name: "getHasValidKey",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ];
  const provider = new ethers.providers.JsonRpcProvider(
    providers[network],
    network
  );
  const contract = new ethers.Contract(lockAddress, ABI, provider);

  return await contract.getHasValidKey(userAddress);
}

export async function hasMembership(userAddress: string) {
  const promises = Object.keys(paywallConfig.locks as any).map(
    (lockAddress) => {
      getHasValidKey({
        lockAddress,
        userAddress,
        network: (paywallConfig.locks as any)[lockAddress].network,
      });
    }
  );
  const results = await Promise.all(promises);
  return !![results].find((x) => x);
}

export const sessionOptions: IronSessionOptions = {
  // Please rotate password here. Look up the docs.
  password:
    process.env.SECRET_COOKIE_PASSWORD?.toString() ||
    "322qrhf9uqb293784tbg87fb43frb76783wgf87vf8267tfv324",
  cookieName: "unlock-next",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

declare module "iron-session" {
  interface IronSessionData {
    user?: User;
  }
}

export async function fetchJson<JSON = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const response = await fetch(input, init);
  const data = await response.json();
  if (response.ok) {
    return data;
  }
  throw new FetchError({
    message: response.statusText,
    response,
    data,
  });
}

export class FetchError extends Error {
  response: Response;
  data: {
    message: string;
  };
  constructor({
    message,
    response,
    data,
  }: {
    message: string;
    response: Response;
    data: {
      message: string;
    };
  }) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError);
    }
    this.name = "FetchError";
    this.response = response;
    this.data = data ?? { message: message };
  }
}
