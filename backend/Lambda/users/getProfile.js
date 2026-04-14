import { User, Complaint } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";

export const handler = async (event) => {
    try {
        console.log("=== Get Profile Handler ===");
        console.log("Event user:", event.user);

        const userId = event.user.userId;
        console.log("Looking for userId:", userId);

        const user = await User.findOne({ userId }).select('-password');
        console.log("Found user profile:", {
            userId: user?.userId,
            emailNotifications: user?.emailNotifications,
            smsNotifications: user?.smsNotifications
        });

        if (!user) {
            console.error("User not found for userId:", userId);
            return response(404, { error: "User not found" });
        }

        // Fetch Stats
        const totalComplaints = await Complaint.countDocuments({ citizenId: user._id });
        const resolvedComplaints = await Complaint.countDocuments({
            citizenId: user._id,
            status: { $in: ['RESOLVED', 'CLOSED'] }
        });

        console.log("Stats:", { totalComplaints, resolvedComplaints });

        return response(200, {
            user: {
                ...user.toObject(),
                image: user.imageUrl, // Map imageUrl to image for frontend consistency
                // Ensure change tracking fields are included
                phoneLastChanged: user.phoneLastChanged || null,
                emailLastChanged: user.emailLastChanged || null,
                secondaryPhone: user.secondaryPhone || null,
                secondaryEmail: user.secondaryEmail || null,
                currentAddress: user.currentAddress || user.address || null,
                permanentAddress: user.permanentAddress || user.address || null,
                emailNotifications: user.emailNotifications,
                smsNotifications: user.smsNotifications
            },
            stats: {
                totalComplaints,
                resolvedComplaints
            }
        });

    } catch (err) {
        console.error("Get Profile Error:", err);
        return response(500, { error: err.message });
    }
};
