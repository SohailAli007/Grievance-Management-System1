import { Team } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";

export const handler = async (event) => {
    try {
        const departmentId = event.queryStringParameters?.departmentId;

        let query = { isActive: true };
        if (departmentId) {
            query.departmentId = departmentId;
        }

        const teams = await Team.find(query)
            .populate('leaderId', 'name email role')
            .populate('departmentId', 'name')
            .sort({ name: 1 });

        return response(200, teams);
    } catch (err) {
        return response(500, { error: err.message });
    }
};
