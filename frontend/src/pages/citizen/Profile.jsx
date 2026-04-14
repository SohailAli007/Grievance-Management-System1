import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { updateProfile, getProfile } from '../../api/api.js';
import toast from 'react-hot-toast';
import { FaCamera, FaUser, FaEnvelope, FaMapMarkerAlt, FaPhone, FaCheckCircle, FaExclamationCircle, FaCog } from 'react-icons/fa';
import ImageCropper from '../../components/ImageCropper.jsx';

function Profile() {
    const navigate = useNavigate();
    const { user: authUser, updateUser } = useAuth();
    const { t } = useLanguage();
    const [profile, setProfile] = useState(null); // Full profile from API
    const [stats, setStats] = useState({ totalComplaints: 0, resolvedComplaints: 0 });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        image: null
    });

    // Address Popup State
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [tempAddress, setTempAddress] = useState('');

    // Cropper State
    const [rawImage, setRawImage] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Fetch latest profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                setProfile(data.user);
                setStats(data.stats);
                setFormData({
                    name: data.user.name,
                    email: data.user.email,
                    image: data.user.image || data.user.imageUrl
                });
                setTempAddress(data.user.currentAddress || '');

                // Sync image and name with context (Header)
                updateUser({
                    name: data.user.name,
                    image: data.user.image || data.user.imageUrl
                });
            } catch (err) {
                console.error("Failed to load profile", err);
                toast.error("Failed to load profile data");
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size too large (max 5MB)");
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setRawImage(reader.result);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        e.target.value = null;
    };

    const handleCropComplete = async (croppedImageBase64) => {
        setIsCropperOpen(false);
        setFormData(prev => ({ ...prev, image: croppedImageBase64 }));

        // Auto-save image on crop? Or wait for manual save. 
        // User flow usually expects "Save Changes" to commit everything.
        // But for image often it's instant in modern apps. 
        // Let's keep it manual save for consistency with the form, 
        // OR separate image save. Implementation plan said "onSave -> Upload".
        // Let's DO instant upload for image to give that "app feel" 
        // separate from name change.

        await saveImage(croppedImageBase64);
    };

    const saveImage = async (base64) => {
        const toastId = toast.loading("Updating profile picture...");
        try {
            const res = await updateProfile({
                name: formData.name, // Send current name to avoid issues
                imageUrl: base64
            });
            if (res.token) {
                localStorage.setItem('gms_token', res.token);
                updateUser({ image: base64 });
            }
            toast.success("Profile picture updated!", { id: toastId });
        } catch (err) {
            toast.error("Failed to update image", { id: toastId });
        }
    };

    const handleAddressUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Updating address...");
        try {
            await updateProfile({ currentAddress: tempAddress });
            setProfile(prev => ({ ...prev, currentAddress: tempAddress }));
            setIsAddressModalOpen(false);
            toast.success("Current address updated", { id: toastId });
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || "Failed to update address";
            toast.error(errorMsg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await updateProfile({
                name: formData.name,
                // Image is already updated or sent again, doesn't hurt
            });

            if (res.token) {
                localStorage.setItem('gms_token', res.token);
                updateUser({ name: res.user.name });
            }
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.error || err.message || "Failed to update profile";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center text-slate-500">Loading profile...</div>;

    const isNameDisabled = profile?.isNameChanged;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-4 md:space-y-6 pb-6 md:pb-10 px-2 md:px-4">
            {/* Header / Blue Zone - Fully Responsive */}
            <div className="relative min-h-[200px] sm:min-h-[240px] lg:min-h-[280px] rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 shadow-xl p-4 sm:p-6 lg:p-8">
                {/* Background Pattern/Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
                </div>

                {/* Responsive Grid Layout */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center">

                    {/* Left Side: Name, Role, Address */}
                    <div className="flex flex-col items-center md:items-start space-y-1 md:space-y-2 order-2 md:order-1">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-none text-center md:text-left">
                            {formData.name || authUser?.name || "SOHAIL ALI"}
                        </h1>
                        <p className="text-blue-200 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
                            Citizen
                        </p>
                        <button
                            onClick={() => setIsAddressModalOpen(true)}
                            className="flex items-center gap-2 text-white/80 text-[10px] sm:text-xs mt-2 md:mt-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/10 w-fit max-w-full transition-all group/addr"
                        >
                            <FaMapMarkerAlt className="text-blue-300 flex-shrink-0 group-hover/addr:scale-110 transition-transform" />
                            <span className="font-semibold truncate">{profile?.currentAddress || "No address provided yet"}</span>
                            <span className="text-[8px] bg-blue-500/20 px-1 rounded uppercase ml-1 opacity-0 group-hover/addr:opacity-100 pb-0.5">Edit</span>
                        </button>
                    </div>

                    {/* Middle: Profile Icon (Avatar) - Centered on all screens */}
                    <div className="flex justify-center order-1 md:order-2">
                        <div className="relative group">
                            <div className="h-28 w-28 sm:h-36 sm:w-36 lg:h-44 lg:w-44 rounded-full border-4 lg:border-[6px] border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl overflow-hidden flex items-center justify-center p-1 transition-transform duration-500 group-hover:scale-[1.02]">
                                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner">
                                    {(formData.image || profile?.image || profile?.imageUrl || authUser?.image) ? (
                                        <img
                                            src={formData.image || profile?.image || profile?.imageUrl || authUser?.image}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center">
                                            <FaUser className="text-3xl sm:text-4xl lg:text-5xl text-slate-300" />
                                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest hidden sm:block">No Photo</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 lg:bottom-3 lg:right-3 bg-blue-500 text-white h-8 w-8 sm:h-10 sm:w-10 rounded-full cursor-pointer flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl hover:scale-110 active:scale-95 z-20 border-2 sm:border-4 border-blue-700/50" title="Change Photo">
                                <FaCamera size={14} className="sm:w-4 sm:h-4" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                            </label>
                        </div>
                    </div>

                    {/* Right Side: Complaint Stats */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-3 justify-center md:justify-start order-3">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-2.5 sm:p-3 rounded-xl md:rounded-2xl flex flex-col items-center md:items-end justify-center min-w-[100px] sm:min-w-[120px] lg:min-w-[140px] shadow-2xl transition-all hover:bg-white/15 flex-1 md:flex-none md:w-full">
                            <span className="text-blue-100 font-black uppercase tracking-tighter text-[8px] sm:text-[9px] mb-0.5">Total Complaints</span>
                            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-none">{stats.totalComplaints}</span>
                        </div>
                        <div className="bg-emerald-400/10 backdrop-blur-xl border border-emerald-400/20 p-2.5 sm:p-3 rounded-xl md:rounded-2xl flex flex-col items-center md:items-end justify-center min-w-[100px] sm:min-w-[120px] lg:min-w-[140px] shadow-2xl transition-all hover:bg-emerald-400/15 flex-1 md:flex-none md:w-full">
                            <span className="text-emerald-100 font-black uppercase tracking-tighter text-[8px] sm:text-[9px] mb-0.5">Resolved Items</span>
                            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400 leading-none">{stats.resolvedComplaints}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Content: Personal Information Form */}
            <div className="w-full max-w-3xl mx-auto">
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8">
                    <div className="mb-4 md:mb-6">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800">{t('permanentInformation')}</h3>
                        <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">{t('permanentAccountDetails')}</p>
                    </div>
                    {/* Save Profile button removed as requested */}

                    <form id="profile-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Primary Phone */}
                        <div className="space-y-1">
                            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 flex items-center gap-2 ml-1">
                                <FaPhone className="text-blue-400 text-xs" /> {t('phoneNumber')}
                            </label>
                            <input
                                type="text"
                                value={profile?.phone || "Not provided"}
                                disabled
                                className="w-full rounded-lg md:rounded-xl border border-slate-100 bg-slate-50 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-600 cursor-not-allowed font-medium"
                            />
                        </div>

                        {/* Secondary Phone (Conditional) */}
                        <div className="space-y-1">
                            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 flex items-center gap-2 ml-1">
                                <FaPhone className="text-blue-300 text-xs" /> {t('secondaryPhone')}
                            </label>
                            <input
                                type="text"
                                value={profile?.secondaryPhone || "None"}
                                disabled
                                className="w-full rounded-lg md:rounded-xl border border-slate-100 bg-slate-50 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-400 cursor-not-allowed font-medium"
                            />
                        </div>

                        {/* Permanent Address */}
                        <div className="space-y-1 col-span-1 sm:col-span-2">
                            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 flex items-center gap-2 ml-1">
                                <FaMapMarkerAlt className="text-blue-400 text-xs" /> {t('permanentAddress')}
                            </label>
                            <input
                                type="text"
                                value={profile?.permanentAddress || "No address added yet"}
                                disabled
                                className="w-full rounded-lg md:rounded-xl border border-slate-100 bg-slate-50 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-600 cursor-not-allowed font-medium"
                            />
                        </div>

                        {/* Secondary Email (Conditional) */}
                        {profile?.secondaryEmail && (
                            <div className="space-y-1 col-span-1 sm:col-span-2">
                                <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 flex items-center gap-2 ml-1">
                                    <FaEnvelope className="text-blue-300 text-xs" /> {t('secondaryEmail')}
                                </label>
                                <input
                                    type="text"
                                    value={profile.secondaryEmail}
                                    disabled
                                    className="w-full rounded-lg md:rounded-xl border border-slate-100 bg-slate-50 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-400 cursor-not-allowed font-medium"
                                />
                            </div>
                        )}

                        {/* Security Disclaimer */}
                        <div className="col-span-1 sm:col-span-2 pt-3 md:pt-4">
                            <div className="p-2.5 sm:p-3 bg-blue-50 rounded-lg md:rounded-xl border border-blue-100 flex items-start md:items-center justify-between gap-3 md:gap-4 flex-col md:flex-row">
                                <p className="text-[9px] sm:text-[10px] text-blue-700 leading-tight font-medium flex-1">
                                    <span className="font-extrabold uppercase bg-blue-200 px-1 rounded mr-1">{t('note')}:</span>
                                    {t('criticalDetailsNote')}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/citizen/settings')}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shadow-md shadow-blue-200 w-full md:w-auto justify-center"
                                >
                                    <FaCog className="text-xs" /> Change Detail
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Address Update Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-blue-600 p-6 text-white text-center">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FaMapMarkerAlt className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold">Update Current Address</h3>
                            <p className="text-blue-100 text-sm mt-1">Please provide your existing residential address</p>
                        </div>

                        <form onSubmit={handleAddressUpdate} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Your Current Address</label>
                                <textarea
                                    required
                                    value={tempAddress}
                                    onChange={(e) => setTempAddress(e.target.value)}
                                    placeholder="Enter full address..."
                                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-0 outline-none transition-all resize-none min-h-[120px]"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddressModalOpen(false)}
                                    className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {loading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                                    Update Now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Image Cropper Modal */}
            {isCropperOpen && rawImage && (
                <ImageCropper
                    imageSrc={rawImage}
                    onCancel={() => setIsCropperOpen(false)}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    );
}

export default Profile;
