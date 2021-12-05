import { NextApiRequest, NextApiResponse } from "next";
import handleError from "../../../helpers/errorHandler";
import Candidate from "../../../models/Candidate";
import convertToTimeSpan from "../../../helpers/timeFormatter";
import withInterviewProtect from "../../../middleware/withInterviewProtect";
import withBodyConverter from "../../../middleware/withBodyConverter";

/**
 * @swagger
 * /api/templates:
 *   post:
 *     description: Create a new template
 */

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const body = req.body;
    //@ts-ignore
    const interviewId = req.interviewId;

    try {
      let time = convertToTimeSpan(body.startedUtc, body.completedUtc);
      await Candidate.findOneAndUpdate(
        { "interviews._id": interviewId },
        {
          "interviews.$.startedUtc": body.startedUtc,
          "interviews.$.completedUtc": body.completedUtc,
          "interviews.$.time": time,
          "interviews.$.answers": body.answers,
        }
      );
      return res
        .status(200)
        .json({ success: "Interview successfully created." });
    } catch (error) {
      const result = handleError(error as Error);
      return res.status(result.code).json({ error: result.error });
    }
  }

  return res.status(405).json({ error: "Only POST requests are allowed." });
};

export default withInterviewProtect(withBodyConverter(handler));
