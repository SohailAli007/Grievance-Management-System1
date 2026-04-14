
import React, { useState } from 'react';
import { addStaff } from '../../api/api.js';
import toast from 'react-hot-toast';

function AddStaffForm({ onUserAdded }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Officer',
        categories: []
    });

    const availableCategories = ["Public Service", "Infrastructure", "Health", "Safety", "Education", "Other"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (cat) => {
        setForm(prev => {
            const cats = prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat];
            return { ...prev, categories: cats };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addStaff(form);
            toast.success(`${form.role} added successfully!`);
            setForm({ name: '', email: '', password: '', role: 'Officer', categories: [] });
            if (onUserAdded) onUserAdded();
        } catch (err) {
            toast.error(err.message || 'Failed to add staff');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Add New Staff Member</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input
                        required
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="e.g. Inspector John Doe"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input
                        required
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="officer@gms.com"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                    <input
                        required
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Temporary password"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Role</label>
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                    >
                        <option value="Officer">Officer</option>
                        <option value="Admin">Administrator</option>
                    </select>
                </div>

                {form.role === 'Officer' && (
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Expertise Categories</label>
                        <div className="flex flex-wrap gap-2">
                            {availableCategories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.categories.includes(cat)
                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="md:col-span-2 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-60"
                    >
                        {loading ? 'Adding Staff member...' : 'Register Staff Account'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddStaffForm;
