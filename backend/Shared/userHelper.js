import { User } from "./models.js";

/**
 * Helper to get full user document from JWT token
 * @param {object} decodedToken - The decoded JWT token containing userId
 * @returns {Promise<object>} - Full user document from database
 */
export const getUserFromToken = async (decodedToken) => {
    if (!decodedToken || !decodedToken.userId) {
        throw new Error("Invalid token: missing userId");
    }

    const user = await User.findOne({ userId: decodedToken.userId, isDeleted: false });

    if (!user) {
        throw new Error("User not found or has been deleted");
    }

    return user;
};
