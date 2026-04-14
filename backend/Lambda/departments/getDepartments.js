import { Department } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";

export const handler = async (event) => {
    try {
        const departments = await Department.find({ isDeleted: false, isActive: true })
            .select('_id name description slaHours adminOfficerId')
            .populate('adminOfficerId', 'name email')
            .sort({ name: 1 });

        return response(200, departments);
    } catch (err) {
        return response(500, { error: err.message });
    }
};
