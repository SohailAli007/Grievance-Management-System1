import React from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ComplaintDetailModal = ({ complaint, onClose }) => {
    if (!complaint) return null;
    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="admin-modal-content"
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 className="font-bold">Complaint Details - {complaint.id}</h3>
                    <button onClick={onClose} className="text-white hover:opacity-70 transition-opacity">✕</button>
                </div>
                <div className="modal-body">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="detail-row">
                            <span className="detail-label">Title</span>
                            <span className="detail-value font-bold">{complaint.title}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Status</span>
                            <span className={`status-badge ${complaint.status === 'RESOLVED' ? 'status-resolved' : 'status-pending'}`}>
                                {complaint.status}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Citizen</span>
                            <span className="detail-value">{complaint.citizen}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Category</span>
                            <span className="detail-value">{complaint.category}</span>
                        </div>
                        <div className="detail-row col-span-2">
                            <span className="detail-label">Assigned To</span>
                            <span className="detail-value">{complaint.assignedTo}</span>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold">Close</button>
                    <button className="primary-btn" onClick={() => toast.success("Feature coming soon")}>Update Status</button>
                </div>
            </motion.div>
        </div>
    );
};

export default ComplaintDetailModal;
