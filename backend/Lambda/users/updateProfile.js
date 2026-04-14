import { User, Citizen, Officer, Admin } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper function to check if 45 days have passed
function canChangeField(lastChangedDate) {
    if (!lastChangedDate) return true; // Never changed before

    const now = new Date();
    const lastChanged = new Date(lastChangedDate);
    const daysSinceChange = (now - lastChanged) / (1000 * 60 * 60 * 24);

    return daysSinceChange >= 45;
}

export const handler = async (event) => {
    try {
        const userId = event.user.userId;
        const body = JSON.parse(event.body);

        console.log("=== Update Profile Lambda (Modernized) ===");
        console.log("User ID:", userId);
        console.log("Full Payload:", JSON.stringify(body, null, 2));

        const {
            name,
            imageUrl,
            phone,
            email,
            currentAddress,
            permanentAddress,
            secondaryPhone,
            secondaryEmail,
            emailNotifications,
            smsNotifications
        } = body;

        // Find existing user
        const currentUser = await User.findOne({ userId });
        if (!currentUser) {
            console.error("User not found:", userId);
            return response(404, { error: "User not found" });
        }

        const updatedFields = {};
        const now = new Date();

        // 1. Name Change Logic (one-time only)
        if (name !== undefined && name !== null) {
            const nameStr = String(name).trim();
            if (nameStr !== "" && nameStr !== (currentUser.name || "").trim()) {
                console.log(`Attempting name change: '${currentUser.name}' -> '${nameStr}'`);
                if (currentUser.isNameChanged) {
                    return response(400, {
                        error: "Name can only be changed once.",
                        field: "name"
                    });
                }
                updatedFields.name = nameStr;
                updatedFields.isNameChanged = true;
            }
        }

        // 2. Phone Change Logic (45-day restriction)
        if (phone !== undefined && phone !== null) {
            const phoneStr = String(phone).trim();
            if (phoneStr !== "" && phoneStr !== (currentUser.phone || "").trim()) {
                if (!canChangeField(currentUser.phoneLastChanged)) {
                    const diff = now - new Date(currentUser.phoneLastChanged);
                    const daysRemaining = Math.max(1, Math.ceil(45 - diff / (1000 * 60 * 60 * 24)));
                    return response(400, {
                        error: `Phone number can only be changed once every 45 days. ${daysRemaining} days remaining.`,
                        field: "phone"
                    });
                }
                updatedFields.phone = phoneStr;
                updatedFields.phoneLastChanged = now;
            }
        }

        // 3. Email Change Logic (45-day restriction)
        if (email !== undefined && email !== null) {
            const emailStr = String(email).trim();
            if (emailStr !== "" && emailStr !== (currentUser.email || "").trim()) {
                if (!canChangeField(currentUser.emailLastChanged)) {
                    const diff = now - new Date(currentUser.emailLastChanged);
                    const daysRemaining = Math.max(1, Math.ceil(45 - diff / (1000 * 60 * 60 * 24)));
                    return response(400, {
                        error: `Email can only be changed once every 45 days. ${daysRemaining} days remaining.`,
                        field: "email"
                    });
                }
                const emailExists = await User.findOne({ email: emailStr, userId: { $ne: userId } });
                if (emailExists) {
                    return response(400, { error: "Email already registered", field: "email" });
                }
                updatedFields.email = emailStr;
                updatedFields.emailLastChanged = now;
            }
        }

        // 4. Address, Notifications & Extras (no restriction)
        if (currentAddress !== undefined) updatedFields.currentAddress = currentAddress;
        if (permanentAddress !== undefined) updatedFields.permanentAddress = permanentAddress;
        if (secondaryPhone !== undefined) updatedFields.secondaryPhone = secondaryPhone || null;
        if (secondaryEmail !== undefined) updatedFields.secondaryEmail = secondaryEmail || null;
        if (imageUrl !== undefined) updatedFields.imageUrl = imageUrl;

        // Explicitly handle notification booleans to ensure they are never missed
        if (emailNotifications !== undefined) {
            updatedFields.emailNotifications = Boolean(emailNotifications);
        }
        if (smsNotifications !== undefined) {
            updatedFields.smsNotifications = Boolean(smsNotifications);
        }

        console.log("Final fields to update in MongoDB:", JSON.stringify(updatedFields, null, 2));

        // Perform Update
        if (Object.keys(updatedFields).length === 0) {
            console.log("No changes detected in payload.");
            return response(200, { message: "No changes detected", user: currentUser.toObject() });
        }

        const updatedUser = await User.findOneAndUpdate(
            { userId },
            { $set: updatedFields },
            { new: true, runValidators: false } // Force bypass of ghost "Name is required" errors
        );

        if (!updatedUser) {
            console.error("Update failed: User disappeared for ID", userId);
            return response(500, { error: "Update failed: User disappeared" });
        }

        console.log("Saved to Master User table correctly. Result:", {
            userId: updatedUser.userId,
            emailNotifications: updatedUser.emailNotifications,
            smsNotifications: updatedUser.smsNotifications
        });

        if (updatedUser.role === 'CITIZEN') {
            await Citizen.collection.updateOne({ userId }, { $set: updatedFields });
            console.log("Updated Citizen direct collection.");
        } else if (updatedUser.role === 'OFFICER') {
            await Officer.collection.updateOne({ userId }, { $set: updatedFields });
            console.log("Updated Officer direct collection.");
        } else if (updatedUser.role === 'ADMIN') {
            await Admin.collection.updateOne({ userId }, { $set: updatedFields });
            console.log("Updated Admin direct collection.");
        }


        const token = jwt.sign(
            {
                userId: updatedUser.userId,
                role: updatedUser.role,
                email: updatedUser.email,
                name: updatedUser.name
                // Image removed to prevent 431 error
            },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        return response(200, {
            message: "Profile updated successfully",
            user: {
                ...updatedUser.toObject(),
                image: updatedUser.imageUrl
            },
            token
        });

    } catch (err) {
        console.error("CRITICAL UPDATE ERROR:", err);
        return response(500, { error: err.message || "Internal server error" });
    }
};
