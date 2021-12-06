import { NextApiRequest, NextApiResponse } from "next";
import handleError from "../../../helpers/errorHandler";
import { sendInterviewEmail } from "../../../helpers/mailer";
import jwt from "jsonwebtoken";
import Candidate from "../../../models/Candidate";
import absoluteUrl from "next-absolute-url";
import Template from "../../../models/Template";
import connectDB from "../../../utils/mongodb";
import withBodyConverter from "../../../middleware/withBodyConverter";
import withProtect from "../../../middleware/withProtect";
import { Roles } from "../../../types";

const { INTERVIEW_PRIVATE_KEY } = process.env;

/**
 * @swagger
 * /api/templates:
 *   post:
 *     description: Create a new template
 */

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    await connectDB();
    const { id } = req.query;
    const body = req.body;
    // @ts-ignore
    const companyId = req.companyId;

    if (!body.emails || body.emails.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one email needs to be provided" });
    }

    try {
      await Promise.all(
        body.emails.map(async (email: string) => {
          let template = await Template.findById(id)
            .select("jobId")
            .lean()
            .orFail();

          let candidate = await Candidate.findOne({
            email: email,
            "interviews.jobId": template.jobId,
            companyId: companyId,
          })
            .select("interviews companyId")
            .populate("companyId interviews.jobId")
            .lean()
            .orFail();

          let foundInterview = candidate.interviews.find(
            // @ts-ignore
            (interview) => interview.jobId._id === template.jobId
          );
          if (!foundInterview) {
            return res.status(404).json({ error: "No interview found." });
          }

          const token = jwt.sign(
            { interviewId: foundInterview._id as string },
            INTERVIEW_PRIVATE_KEY as string,
            { expiresIn: "7d" as string }
          );

          var { origin } = absoluteUrl(req);
          var url = `${origin}/interview/${token}`;

          await sendInterviewEmail(
            // @ts-ignore
            candidate.companyId.name,
            // @ts-ignore
            foundInterview.jobId.name,
            email,
            url
          );
        })
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      const result = handleError(error as Error);
      return res.status(result.code).json({ error: result.error });
    }
  }

  return res.status(405).json({ error: "Only POST requests are allowed." });
};

export default withProtect(withBodyConverter(handler), [
  Roles.Manager,
  Roles.Admin,
]);
