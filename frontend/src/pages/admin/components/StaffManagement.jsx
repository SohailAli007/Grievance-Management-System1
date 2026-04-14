import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaPlus, FaChevronDown, FaChevronRight, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { addStaff, getDepartments } from '../../../api/api.js';

const ProfileTooltip = ({ user }) => (
    <div className="absolute z-50 bg-slate-800 text-white p-4 rounded-xl shadow-2xl w-64 -translate-y-full mb-2 border border-slate-700 pointer-events-none">
        <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-600 border-2 border-slate-500">
                {user.imageUrl ? <img src={user.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold">{user.name.charAt(0)}</div>}
            </div>
            <div>
                <p className="font-bold text-sm">{user.name}</p>
                <p className="text-[10px] text-slate-400">{user.role} - {user.departmentName || 'N/A'}</p>
            </div>
        </div>
        <div className="space-y-1 text-[11px]">
            <p><span className="text-slate-500">Phone:</span> {user.phone || 'N/A'}</p>
            <p><span className="text-slate-500">Email:</span> {user.email}</p>
            <p><span className="text-slate-500">Position:</span> {user.role === 'ADMIN' ? 'Head of Operations' : user.role === 'OFFICER' ? 'Field Officer' : 'Staff Support'}</p>
        </div>
    </div>
);

const UserRow = ({ user, allUsers, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Filter children based on managerId
    const children = allUsers.filter(u => u.managerId === user.id || u.managerId === user.userId);
    const hasChildren = children.length > 0;

    return (
        <>
            <tr className={`border-b border-slate-50 transition-colors ${level > 0 ? 'bg-slate-50/50' : ''}`}>
                <td className="py-4 px-4">
                    <div className="flex items-center gap-3" style={{ paddingLeft: `${level * 2}rem` }}>
                        {hasChildren && (
                            <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-400 hover:text-blue-600">
                                {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                            </button>
                        )}
                        {!hasChildren && level > 0 && <div className="w-3" />}
                        <div className="relative group">
                            <div
                                className="w-10 h-10 rounded-full bg-slate-200 border border-slate-100 overflow-hidden cursor-pointer"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                {user.imageUrl ? <img src={user.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">{user.name.charAt(0)}</div>}
                            </div>
                            <AnimatePresence>
                                {isHovered && <ProfileTooltip user={user} />}
                            </AnimatePresence>
                        </div>
                        <span className="font-bold text-slate-700">{user.name}</span>
                    </div>
                </td>
                <td className="py-4 text-slate-500 text-sm">{user.email}</td>
                <td className="py-4">
                    <span className="text-xs font-bold text-slate-600">
                        {user.role} ({user.departmentName || 'All'})
                    </span>
                </td>
                <td className="py-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-xs font-bold ${user.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                            {user.status === 'ACTIVE' ? 'Active' : 'On Leave'}
                        </span>
                    </div>
                </td>
                <td className="py-4">
                    <button className="text-blue-600 hover:underline text-xs font-bold">Details</button>
                </td>
            </tr>
            {isExpanded && children.map(child => (
                <UserRow key={child.id} user={child} allUsers={allUsers} level={level + 1} />
            ))}
        </>
    );
};

const StaffManagement = ({ users, loading, onRefresh }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'OFFICER',
        phone: '',
        departmentName: '',
        managerId: '',
        status: 'ACTIVE'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isModalOpen) {
            fetchDepartments();
        }
    }, [isModalOpen]);

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (err) {
            console.error("Failed to load departments", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addStaff(formData);
            toast.success("Staff added successfully!");
            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'OFFICER', phone: '', departmentName: '', managerId: '', status: 'ACTIVE' });
            if (onRefresh) onRefresh();
        } catch (err) {
            toast.error(err.response?.data?.error || "Error adding staff");
        } finally {
            setSubmitting(false);
        }
    };

    // Filter top-level Heads (ADMINs or anyone without a manager)
    const heads = users.filter(u => u.role === 'ADMIN' || !u.managerId);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Staff Management</h2>
                    <p className="text-slate-500 text-sm">Managing organizational hierarchy and roles</p>
                </div>
                <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 flex items-center gap-2 transition-all" onClick={() => setIsModalOpen(true)}>
                    <FaPlus /> Add New Member
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-400 tracking-wider">Name</th>
                            <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Email</th>
                            <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Role (Dept)</th>
                            <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Status</th>
                            <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-20 text-slate-400">Loading directory...</td></tr>
                        ) : heads.length > 0 ? (
                            heads.map(h => <UserRow key={h.id} user={h} allUsers={users} />)
                        ) : (
                            <tr><td colSpan="5" className="text-center py-20 text-slate-400 italic">No staff found in the directory.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal remains largely similar but with more fields */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-xl">✕</button>
                        <h3 className="text-2xl font-black text-slate-800 mb-6">New Directory Entry</h3>

                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Full Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="w-full border-2 border-slate-50 p-3 rounded-xl focus:border-blue-500 outline-none transition-all" required />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border-2 border-slate-50 p-3 rounded-xl focus:border-blue-500 outline-none transition-all" required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border-2 border-slate-50 p-3 rounded-xl focus:border-blue-500 outline-none transition-all" required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Phone</label>
                                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border-2 border-slate-50 p-3 rounded-xl focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Role</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="w-full border-2 border-slate-50 p-3 rounded-xl focus:border-blue-500 outline-none transition-all">
                                    <option value="ADMIN">Head (Admin)</option>
                                    <option value="OFFICER">Field Officer</option>
                                    <option value="STAFF">Support Staff</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Manager</label>
                                <select name="managerId" value={formData.managerId} onChange={handleChange} className="w-full border-2 border-slate-50 p-3 rounded-xl focus:border-blue-500 outline-none transition-all">
                                    <option value="">None</option>
                                    {users.filter(u => u.role !== 'STAFF').map(u => (
                                        <option key={u.id} value={u.userId}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2 pt-4">
                                <button type="submit" disabled={submitting} className="w-full bg-slate-800 text-white font-black py-4 rounded-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                                    {submitting ? 'Registering...' : 'Add to Directory'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default StaffManagement;
