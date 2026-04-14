import React, { useState, useEffect } from 'react';
import { fileComplaint as fileComplaintApi, getDepartments, getCategories } from '../../api/api.js';
import toast from 'react-hot-toast';
import { FaCloudUploadAlt, FaMapMarkerAlt, FaFileAlt, FaTags, FaBuilding } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext.jsx';

function FileComplaint() {
    const { t } = useLanguage();
    const [form, setForm] = useState({
        title: '',
        description: '',
        department: '',
        location: '',
        image: null,
    });
    const [submitting, setSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const depts = await getDepartments();
                setDepartments(depts);
            } catch (err) {
                console.error("Failed to load departments", err);
            } finally {
                setLoadingData(false);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        const loadCategories = async () => {
            if (!form.department) {
                setCategories([]);
                return;
            }
            try {
                // Find department ID from name
                const dept = departments.find(d => d.name === form.department);
                if (dept) {
                    const cats = await getCategories(dept._id);
                    setCategories(cats);
                }
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        loadCategories();
    }, [form.department, departments]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const updates = { [name]: value };
            if (name === 'department') updates.title = ''; // Reset category if dept changes
            return { ...prev, ...updates };
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Image too large. Max 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setForm(prev => ({ ...prev, image: reader.result }));
            reader.readAsDataURL(file);
        } else {
            setForm(prev => ({ ...prev, image: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.department) {
            toast.error("Please select department and issue category");
            return;
        }

        setSubmitting(true);
        const payload = {
            title: form.title,
            category: form.title,
            description: form.description,
            department: form.department,
            location: form.location,
            image: form.image,
            priority: "MEDIUM"
        };

        try {
            await fileComplaintApi(payload);
            toast.success('Successfully Submitted!');
            setForm({ title: '', description: '', department: '', location: '', image: null });
            if (document.getElementById('image')) document.getElementById('image').value = '';
        } catch (err) {
            console.error("FULL COMPLAINT ERROR OBJECT:", err);
            const errorMsg = err.response?.data?.error || 'Failed to submit complaint';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) return <div className="p-10 text-center text-slate-500">{t('loading')}</div>;

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl p-6 md:p-8 max-h-[calc(100vh-120px)] flex flex-col">
            <div className="mb-4">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{t('fileANewComplaint')}</h3>
                <p className="text-[11px] text-slate-500 font-medium">{t('reportIssueToAuthorities')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 overflow-hidden flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Department */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 ml-1">{t('department')}</label>
                            <select
                                name="department"
                                value={form.department}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            >
                                <option value="">{t('selectDepartment')}</option>
                                {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                            </select>
                        </div>

                        {/* Title */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 ml-1">{t('issueCategory')}</label>
                            <select
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                disabled={!form.department}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all disabled:opacity-50"
                            >
                                <option value="">{t('selectIssue')}</option>
                                {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 ml-1">{t('locationAddress')}</label>
                        <input
                            type="text"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            required
                            placeholder={t('whereDidThisHappen')}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 ml-1">{t('detailsOptional')}</label>
                        <input
                            type="text"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            required
                            placeholder={t('additionalContext')}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] font-bold text-slate-600 ml-1">{t('evidencePhoto')}</label>
                        <label htmlFor="image" className="block w-full border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group overflow-hidden">
                            <div className="h-24 flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-500">
                                {form.image ? (
                                    <div className="relative w-full h-full p-1.5 flex items-center justify-center">
                                        <img src={form.image} alt="Preview" className="h-full object-contain rounded-lg" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Change Image</div>
                                    </div>
                                ) : (
                                    <>
                                        <FaCloudUploadAlt className="text-2xl mb-1" />
                                        <p className="text-[10px] uppercase font-bold tracking-wider">{t('uploadImage')}</p>
                                    </>
                                )}
                            </div>
                            <input id="image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest py-4 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                    >
                        {submitting ? t('processing') : t('submitComplaint')}
                    </button>
                    <p className="text-center text-[9px] text-slate-400 mt-2 font-medium">{t('complaintSuccessNote')}</p>
                </div>
            </form>
        </div>
    );
}

export default FileComplaint;
