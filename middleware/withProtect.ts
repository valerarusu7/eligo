import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import connectDB from "../utils/mongodb";
import User from "../models/User";
import { Error } from "mongoose";
import handleError from "../helpers/errorHandler";
import { AsyncRequestHandler, IUserTokenPayload } from "../types";

const { ACCOUNT_ACCESS_PRIVATE_KEY } = process.env;

const withProtect = (handler: AsyncRequestHandler, roles: string[]) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const { accessToken } = req.cookies;

    if (!req.cookies || !accessToken) {
      return res.status(401).json({ error: "Please login to get access." });
    }

    try {
      const decoded = jwt.verify(
        accessToken,
        ACCOUNT_ACCESS_PRIVATE_KEY as string
      );

      const { id, role, companyId } = decoded as IUserTokenPayload;
      if (!roles.includes(role)) {
        return res
          .status(401)
          .json({ error: "You don't have enough permission." });
      }

      await connectDB();
      const currentUser = await User.findById(id).lean();
      if (!currentUser) {
        return res.status(401).json({
          error: "The user belonging to this token no longer exists.",
        });
      }

      // @ts-ignore
      req.user = currentUser;
      // @ts-ignore
      req.companyId = companyId;

      return handler(req, res);
    } catch (error) {
      const result = handleError(error as Error);
      return res.status(result.code).json({ error: result.error });
    }
  };
};

export default withProtect;
