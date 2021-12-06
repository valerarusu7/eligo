import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { Error } from "mongoose";
import handleError from "../helpers/errorHandler";
import { AsyncRequestHandler, IRegistrationTokenPayload } from "../types";
import connectDB from "../utils/mongodb";

const { ACCOUNT_PRIVATE_KEY } = process.env;

const withRegistrationProtect = (handler: AsyncRequestHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authValue = req.headers.authorization;

    if (!authValue) {
      return res.status(401).json({ error: "No authentication provided." });
    }

    const token = authValue.replace("Bearer ", "");
    try {
      var decodedToken = jwt.verify(token, ACCOUNT_PRIVATE_KEY as string);
      const { email, companyId, companyName } =
        decodedToken as IRegistrationTokenPayload;
      if (!email || !companyId || !companyName) {
        return res.status(401).json({ error: "Token is invalid." });
      }

      // @ts-ignore
      req.email = email;
      // @ts-ignore
      req.companyId = companyId;
      // @ts-ignore
      req.companyName = companyName;

      await connectDB();
      return handler(req, res);
    } catch (error) {
      const result = handleError(error as Error);
      return res.status(result.code).json({ error: result.error });
    }
  };
};

export default withRegistrationProtect;
