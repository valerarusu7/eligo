import cookie from "cookie";
import { NextApiRequest, NextApiResponse } from "next";
import User from "../../../models/User";
import jwt from "jsonwebtoken";
import handleError from "../../../helpers/errorHandler";
import connectDB from "../../../utils/mongodb";
import withBodyConverter from "../../../middleware/withBodyConverter";

const { ACCOUNT_ACCESS_PRIVATE_KEY, ACCOUNT_REFRESH_PRIVATE_KEY } = process.env;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    await connectDB();
    const body = req.body;

    if (!body || !body.email || !body.password) {
      return res
        .status(400)
        .json({ error: "Email and password cannot be empty." });
    }

    try {
      const user = await User.findOne({
        email: body.email,
      });

      if (!user || !(await user.comparePassword(body.password))) {
        return res
          .status(401)
          .json({ error: "Email or password is incorrect." });
      }

      const accessToken = jwt.sign(
        {
          id: user._id,
          email: user.email,
          name: user.firstName + " " + user.lastName,
          companyId: user.companyId,
          role: user.role,
        },
        ACCOUNT_ACCESS_PRIVATE_KEY as string,
        { expiresIn: "60m" as string }
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        ACCOUNT_REFRESH_PRIVATE_KEY as string,
        { expiresIn: "3d" as string }
      );

      res.setHeader("Set-Cookie", [
        cookie.serialize("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "development",
          maxAge: 60 * 10 * 6,
          sameSite: "strict",
          path: "/",
        }),
        cookie.serialize("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "development",
          maxAge: 60 * 60 * 24 * 3,
          sameSite: "strict",
          path: "/",
        }),
      ]);

      return res.status(200).json({ success: "Successfully logged in." });
    } catch (error) {
      const result = handleError(error as Error);
      return res.status(result.code).json({ error: result.error });
    }
  }

  return res.status(405).json({ error: "Only POST requests are allowed." });
};

export default withBodyConverter(handler);
