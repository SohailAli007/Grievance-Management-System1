import { Complaint, User, Department, Feedback } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";
import { verify } from "../../Shared/jwt.js";
import mongoose from "mongoose";

export const handler = async (event) => {
    try {
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        if (!authHeader) return response(401, { error: "Missing Token" });

        const token = authHeader.replace("Bearer ", "");
        const decoded = verify(token);

        if (!["ADMIN", "ADMIN_OFFICER"].includes(decoded.role)) {
            return response(403, { error: "Access Denied" });
        }

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // 1. Core Statistics
        const totalToday = await Complaint.countDocuments({ createdAt: { $gte: startOfToday }, isDeleted: { $ne: true } });
        const pendingCount = await Complaint.countDocuments({ status: "PENDING", isDeleted: { $ne: true } });
        const resolvedTotal = await Complaint.countDocuments({ status: { $in: ["RESOLVED", "CLOSED"] }, isDeleted: { $ne: true } });

        // 2. Complaints by Department (Pie Chart)
        const depts = await Department.find({ isDeleted: { $ne: true } });
        const totalAll = await Complaint.countDocuments({ isDeleted: { $ne: true } });

        const byDept = await Complaint.aggregate([
            { $match: { isDeleted: { $ne: true } } },
            { $group: { _id: "$departmentName", count: { $sum: 1 } } }
        ]);

        const departmentChart = byDept.map(d => ({
            name: d._id || "Other",
            count: d.count,
            percentage: totalAll > 0 ? Math.round((d.count / totalAll) * 100) : 0
        }));

        // 3. Monthly Trend (Bar Chart - Last 4 Months)
        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 3);
        fourMonthsAgo.setDate(1);
        fourMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyTrend = await Complaint.aggregate([
            { $match: { createdAt: { $gte: fourMonthsAgo }, isDeleted: { $ne: true } } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const trendData = monthlyTrend.map(m => ({
            month: monthNames[m._id.month - 1],
            count: m.count
        }));

        // 4. Top Problem Areas (Locations)
        const topLocations = await Complaint.aggregate([
            { $match: { isDeleted: { $ne: true }, locationText: { $exists: true, $ne: "" } } },
            { $group: { _id: "$locationText", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);

        const problemAreas = topLocations.map(l => ({
            name: l._id,
            count: l.count
        }));

        // 5. Overdue Complaints
        // For simplicity, overdue = Pending and created > 24h ago
        const overdueLimit = new Date();
        overdueLimit.setHours(overdueLimit.getHours() - 24);

        const overdueComplaints = await Complaint.find({
            status: "PENDING",
            createdAt: { $lt: overdueLimit },
            isDeleted: { $ne: true }
        }).sort({ createdAt: 1 }).limit(3);

        const formattedOverdue = overdueComplaints.map(c => ({
            id: c.complaintId,
            title: c.title,
            location: c.locationText,
            date: c.createdAt
        }));

        const staffCounts = {
            admin: await User.countDocuments({ role: "ADMIN", isDeleted: { $ne: true } }),
            officers: await User.countDocuments({ role: { $in: ["ADMIN_OFFICER", "FIELD_OFFICER"] }, isDeleted: { $ne: true } }),
            workers: await User.countDocuments({ role: { $in: ["WORKER", "STAFF"] }, isDeleted: { $ne: true } })
        };

        const deptWithSla = depts.map(d => ({
            name: d.name,
            sla: d.slaHours
        }));

        const analytics = {
            stats: {
                today: totalToday,
                pending: pendingCount,
                resolved: resolvedTotal
            },
            charts: {
                department: departmentChart,
                trend: trendData
            },
            problemAreas,
            overdue: formattedOverdue,
            staffCounts,
            departments: deptWithSla
        };

        return response(200, analytics);

    } catch (err) {
        console.error("Analytics Error:", err);
        return response(500, { error: err.message });
    }
};
