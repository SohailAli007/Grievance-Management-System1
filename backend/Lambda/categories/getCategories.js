import { Category } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";

export const handler = async (event) => {
    try {
        const departmentId = event.queryStringParameters?.departmentId;

        let query = { isActive: true };
        if (departmentId) {
            query.departmentId = departmentId;
        }

        const categories = await Category.find(query)
            .populate('departmentId', 'name')
            .sort({ priority: -1, name: 1 });

        return response(200, categories);
    } catch (err) {
        return response(500, { error: err.message });
    }
};
