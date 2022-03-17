import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { User } from "~/types";
import { hasMembership, sessionOptions } from "~/utils";
import { paywallConfig } from "~/config/unlock";
import { ethers } from "ethers";
import { basePath } from "~/config/site";
import crypto from "crypto";

export default withIronSessionApiRoute(loginRoute, sessionOptions);

async function loginRoute(request: NextApiRequest, response: NextApiResponse) {
  try {
    let { signature, digest } = extract(request);
    const requestURL = new URL(request.url!, basePath);

    if (
      requestURL.searchParams.has("signature") &&
      requestURL.searchParams.has("digest")
    ) {
      signature = requestURL.searchParams.get("signature")!;
      digest = requestURL.searchParams.get("digest")!;
    }

    const messageToSign = `Login: ${crypto.randomBytes(32).toString("hex")}`;

    if (!signature) {
      redirectToPurchase(messageToSign, request, response);
    } else {
      const address = ethers.utils.verifyMessage(digest!, signature);
      const hasAccess = await hasMembership(address);

      if (!hasAccess) {
        return response
          .status(401)
          .send(
            "You do not have a valid membership. You can purchase one by reloading this page and checking out a membership this time."
          );
      }

      const user: User = {
        walletAddress: address,
        isLoggedIn: true,
        message: messageToSign,
        signature,
      };

      request.session.user = user;
      await request.session.save();
      response.redirect(basePath);
    }
  } catch (error) {
    response.status(500).json({ message: (error as Error).message });
  }
}

function redirectToPurchase(
  digest: string,
  request: NextApiRequest,
  response: NextApiResponse
) {
  const redirectBack = new URL(request.url!, basePath);
  redirectBack.searchParams.append("digest", digest);
  const redirectUrl = new URL("https://app.unlock-protocol.com/checkout");
  paywallConfig.messageToSign = digest;
  redirectUrl.searchParams.append(
    "paywallConfig",
    JSON.stringify(paywallConfig)
  );
  redirectUrl.searchParams.append("redirectUri", redirectBack.toString());
  return response.redirect(redirectUrl.toString());
}

export function extract(request: NextApiRequest) {
  const prefix = "next_";
  const cookiesHeader = request.headers["Cookie"] as string;
  if (!cookiesHeader) {
    return {};
  }

  const cookies = Object.fromEntries(
    cookiesHeader.split("; ").map((x) => x.split("="))
  );

  const signature = cookies[`${prefix}signature`]
    ? decodeURIComponent(cookies[`${prefix}signature`])
    : "";

  const digest = cookies[`${prefix}message`]
    ? decodeURIComponent(cookies[`${prefix}message`])
    : "";

  return {
    signature,
    digest,
  };
}
