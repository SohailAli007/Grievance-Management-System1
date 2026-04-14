import jwt from "jsonwebtoken";

const getSecret = () => process.env.JWT_SECRET || "dev-secret";

export const createToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      userId: user.userId,
      role: user.role,
      email: user.email,
      name: user.name

    },
    getSecret(),
    { expiresIn: "7d" }
  );

export const verify = (token) => jwt.verify(token, getSecret());
