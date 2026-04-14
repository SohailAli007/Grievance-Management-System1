import { verify } from "../../Shared/jwt.js";
import { response } from "../../Shared/response.js";

export const handler = async (event) => {
  try {
    const auth = event.headers?.Authorization || event.headers?.authorization;
    if (!auth) return response(401, { error: "Missing token" });

    const token = auth.replace("Bearer ", "");
    const decoded = verify(token);

    return response(200, { message: "Valid token", user: decoded });
  } catch {
    return response(401, { error: "Invalid or expired token" });
  }
};
