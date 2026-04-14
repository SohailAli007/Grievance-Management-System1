import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getProfile, updateProfile } from '../../api/api.js';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaExclamationTriangle, FaBell, FaLock, FaPalette, FaGlobe, FaCog } from 'react-icons/fa';

function Settings() {
    const { user: authUser, updateUser } = useAuth();
    const { t, language, changeLanguage, availableLanguages } = useLanguage();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [activeTab, setActiveTab] = useState('account'); // 'account' or 'details'

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        secondaryPhone: '',
        currentAddress: '',
        permanentAddress: '',
        email: '',
        secondaryEmail: ''
    });

    // Account Settings State
    const [accountSettings, setAccountSettings] = useState({
        notifications: true,
        emailNotifications: true,
        smsNotifications: false,
        theme: 'light'
    });

    // Track last change dates (would come from backend)
    const [lastChanged, setLastChanged] = useState({
        phone: null,
        email: null
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                setProfile(data.user);

                // Split name into first and last
                const nameParts = (data.user.name || '').split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                setFormData({
                    firstName,
                    lastName,
                    phone: data.user.phone || '',
                    secondaryPhone: data.user.secondaryPhone || '',
                    currentAddress: data.user.currentAddress || '',
                    permanentAddress: data.user.permanentAddress || '',
                    email: data.user.email || '',
                    secondaryEmail: data.user.secondaryEmail || ''
                });

                // Set last changed dates
                setLastChanged({
                    phone: data.user.phoneLastChanged || null,
                    email: data.user.emailLastChanged || null
                });

                // Load notification preferences with explicit fallbacks
                console.log("Fetched Notification Settings:", {
                    email: data.user.emailNotifications,
                    sms: data.user.smsNotifications
                });

                setAccountSettings(prev => ({
                    ...prev,
                    emailNotifications: typeof data.user.emailNotifications === 'boolean' ? data.user.emailNotifications : true,
                    smsNotifications: typeof data.user.smsNotifications === 'boolean' ? data.user.smsNotifications : false
                }));

                // Sync name and image with context
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

    const canChangeField = (field) => {
        if (!lastChanged[field]) return true;
        const lastChangeDate = new Date(lastChanged[field]);
        const daysSinceChange = (Date.now() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceChange >= 45;
    };

    const getDaysRemaining = (field) => {
        if (!lastChanged[field]) return 0;
        const lastChangeDate = new Date(lastChanged[field]);
        const daysSinceChange = (Date.now() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24);
        return Math.max(0, Math.ceil(45 - daysSinceChange));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            const updateData = {
                name: fullName,
                phone: formData.phone,
                secondaryPhone: formData.secondaryPhone,
                currentAddress: formData.currentAddress,
                permanentAddress: formData.permanentAddress,
                email: formData.email,
                secondaryEmail: formData.secondaryEmail
            };

            const response = await updateProfile(updateData);
            setProfile(response.user);

            if (response.token) {
                localStorage.setItem('gms_token', response.token);
                updateUser({ name: response.user.name });
            }

            toast.success('Profile updated successfully!');
        } catch (err) {
            console.error("Update failed", err);
            const errorMsg = err.response?.data?.error || err.message || 'Failed to update profile';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleAccountSettingsSave = async () => {
        setLoading(true);
        try {
            const res = await updateProfile({
                emailNotifications: Boolean(accountSettings.emailNotifications),
                smsNotifications: Boolean(accountSettings.smsNotifications)
            });

            if (res.user) {
                setAccountSettings(prev => ({
                    ...prev,
                    emailNotifications: res.user.emailNotifications !== undefined ? res.user.emailNotifications : prev.emailNotifications,
                    smsNotifications: res.user.smsNotifications !== undefined ? res.user.smsNotifications : prev.smsNotifications
                }));
                // Update local profile too
                setProfile(res.user);
            }

            toast.success('Account settings saved!');
        } catch (err) {
            console.error("Failed to save settings", err);
            const errorMsg = err.response?.data?.error || err.message || 'Failed to save settings';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center text-slate-500">{t('loading')}</div>;

    const phoneDisabled = !canChangeField('phone');
    const emailDisabled = !canChangeField('email');

    return (
        <div className="w-full max-w-5xl mx-auto space-y-4 md:space-y-6 pb-6 md:pb-10 px-2 md:px-4">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex gap-1">
                <button
                    onClick={() => setActiveTab('account')}
                    className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'account'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <FaCog className="inline mr-2" />
                    Account Settings
                </button>
                <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'details'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <FaUser className="inline mr-2" />
                    Change Details
                </button>
            </div>

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">{t('accountSettings')}</h2>
                        <p className="text-slate-500 text-sm mt-1">Manage your account preferences</p>
                    </div>

                    <div className="space-y-6">
                        {/* Language Preference */}
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaGlobe className="text-blue-500 text-xl" />
                                    <div>
                                        <h3 className="font-bold text-slate-800">{t('language')}</h3>
                                        <p className="text-xs text-slate-500">Choose your preferred language</p>
                                    </div>
                                </div>
                                <select
                                    value={language}
                                    onChange={(e) => changeLanguage(e.target.value)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                >
                                    {availableLanguages.map(lang => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.nativeName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3 mb-4">
                                <FaBell className="text-blue-500 text-xl" />
                                <div>
                                    <h3 className="font-bold text-slate-800">{t('notifications')}</h3>
                                    <p className="text-xs text-slate-500">Manage how you receive updates</p>
                                </div>
                            </div>
                            <div className="space-y-3 ml-9">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm text-slate-700">Email Notifications</span>
                                    <input
                                        type="checkbox"
                                        checked={accountSettings.emailNotifications}
                                        onChange={(e) => setAccountSettings({ ...accountSettings, emailNotifications: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-100"
                                    />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm text-slate-700">SMS Notifications</span>
                                    <input
                                        type="checkbox"
                                        checked={accountSettings.smsNotifications}
                                        onChange={(e) => setAccountSettings({ ...accountSettings, smsNotifications: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-100"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Privacy & Security */}
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3">
                                <FaLock className="text-blue-500 text-xl" />
                                <div>
                                    <h3 className="font-bold text-slate-800">{t('privacySecurity')}</h3>
                                    <p className="text-xs text-slate-500">Manage your security settings</p>
                                </div>
                            </div>
                            <div className="mt-4 ml-9">
                                <button
                                    onClick={() => toast.success("Password security settings will be available in the next update!", { icon: '🛡️' })}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {t('changePasswordLink')}
                                </button>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleAccountSettingsSave}
                                disabled={loading}
                                className={`px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200 flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <FaSave /> {loading ? 'Saving...' : t('saveChanges')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Details Tab */}
            {activeTab === 'details' && (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">{t('changeDetails')}</h2>
                        <p className="text-slate-500 text-sm mt-1">Update your personal information</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <FaUser className="text-blue-500" /> {t('firstName')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <FaUser className="text-blue-500" /> {t('lastName')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Phone Numbers */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <FaPhone className="text-blue-500" /> {t('phoneNumber')}
                                    {phoneDisabled && <FaExclamationTriangle className="text-amber-500 text-xs" />}
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={phoneDisabled}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${phoneDisabled
                                        ? 'bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed'
                                        : 'border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                                        }`}
                                    required
                                />
                                {phoneDisabled && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                        <FaExclamationTriangle /> Can change in {getDaysRemaining('phone')} days
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <FaPhone className="text-blue-500" /> {t('secondaryPhone')} <span className="text-xs text-slate-400">({t('optional')})</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.secondaryPhone}
                                    onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Addresses */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-blue-500" /> {t('currentAddress')}
                                </label>
                                <textarea
                                    value={formData.currentAddress}
                                    onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-blue-500" /> {t('permanentAddress')}
                                </label>
                                <textarea
                                    value={formData.permanentAddress}
                                    onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Addresses */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <FaEnvelope className="text-blue-500" /> {t('emailAddress')}
                                    {emailDisabled && <FaExclamationTriangle className="text-amber-500 text-xs" />}
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={emailDisabled}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${emailDisabled
                                        ? 'bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed'
                                        : 'border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                                        }`}
                                    required
                                />
                                {emailDisabled && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                        <FaExclamationTriangle /> Can change in {getDaysRemaining('email')} days
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <FaEnvelope className="text-blue-500" /> {t('secondaryEmail')} <span className="text-xs text-slate-400">({t('optional')})</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.secondaryEmail}
                                    onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200 disabled:opacity-70 flex items-center gap-2"
                            >
                                {loading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                                <FaSave /> {t('saveChanges')}
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-xs text-blue-700 font-medium">
                                <span className="font-bold uppercase">{t('note')}:</span> Phone number and email address can only be changed once every 45 days for security purposes.
                            </p>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Settings;
