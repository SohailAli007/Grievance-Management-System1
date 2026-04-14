import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../Shared/db.js";
import { response } from "../Shared/response.js";
import { verify } from "../Shared/jwt.js";

export const handler = async (event) => {
  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) {
      return response(401, { error: "Missing Authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const user = verify(token);

    const complaintId = event.queryStringParameters?.complaintId;
    if (!complaintId) return response(400, { error: "Missing complaintId" });

    const data = await ddb.send(
      new GetCommand({
        TableName: process.env.COMPLAINT_TABLE,
        Key: { complaintId },
      })
    );

    const complaint = data.Item;
    if (!complaint) return response(404, { error: "Complaint not found" });

    // ensure user owns it OR is admin/officer
    if (complaint.userId !== user.userId && user.role === "CITIZEN") {
      return response(403, { error: "Not authorized to view this complaint" });
    }


    return response(200, complaint);
  } catch (err) {
    return response(500, { error: err.message });
  }
};
