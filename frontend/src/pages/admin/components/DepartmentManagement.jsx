import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBuilding } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DepartmentManagement = ({ departments }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Placeholder logic for adding department
    const handleAddStart = () => {
        toast.success("Add Department feature coming soon!");
        // setIsModalOpen(true); // Uncomment when ready
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="view-header">
                <h2 className="view-title">Department Administration</h2>
                <button className="primary-btn" onClick={handleAddStart}>
                    <FaBuilding /> Add Department
                </button>
            </div>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Dept Name</th>
                            <th>Head of Dept</th>
                            <th>SLA Target</th>
                            <th>Total Complaints</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments && departments.length > 0 ? (
                            departments.map(d => (
                                <tr key={d.name}>
                                    <td className="font-bold text-slate-700">{d.name}</td>
                                    <td>{d.adminOfficerId?.name || "Unassigned"}</td>
                                    <td className="text-emerald-600 font-bold">{d.slaHours || d.sla} Hours</td>
                                    <td>{d.count || 0}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="text-center py-10">No departments found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Dept Modal Placeholder */}
            {/* {isModalOpen && (...)} */}
        </motion.div>
    );
};

export default DepartmentManagement;
