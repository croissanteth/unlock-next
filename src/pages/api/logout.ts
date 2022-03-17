import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "~/utils";
import { NextApiRequest, NextApiResponse } from "next";
import type { User } from "~/types";

export default withIronSessionApiRoute(logoutRoute, sessionOptions);

function logoutRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  req.session.destroy();
  res.json({
    isLoggedIn: false,
    walletAddress: "",
    message: "",
    signature: "",
  });
}
