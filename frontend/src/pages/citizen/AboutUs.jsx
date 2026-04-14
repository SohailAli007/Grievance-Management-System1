import { FaUsers, FaHistory, FaBuilding, FaGlobeAmericas, FaShieldAlt } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext.jsx';

function AboutUs() {
    const { t } = useLanguage();
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-500 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl">
                <h1 className="text-4xl font-extrabold mb-4">Grievance Management System</h1>
                <p className="text-indigo-100 text-lg max-w-2xl mx-auto leading-relaxed">
                    {t('connectingCitizens')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Our Mission */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                    <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl">
                        <FaGlobeAmericas />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{t('ourMission')}</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">
                        {t('missionText')}
                    </p>
                </div>

                {/* Transparency */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                    <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">
                        <FaShieldAlt />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{t('transparencyFirst')}</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">
                        {t('transparencyText')}
                    </p>
                </div>
            </div>

            {/* Why Choose GMS */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                    <FaBuilding className="text-indigo-600" /> {t('coreValues')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center space-y-3">
                        <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-blue-500 text-2xl border border-slate-100">
                            <FaUsers />
                        </div>
                        <h4 className="font-bold text-slate-700">{t('citizenCentric')}</h4>
                        <p className="text-xs text-slate-400">{t('citizenCentricText')}</p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-emerald-500 text-2xl border border-slate-100">
                            <FaHistory />
                        </div>
                        <h4 className="font-bold text-slate-700">{t('fastExecution')}</h4>
                        <p className="text-xs text-slate-400">{t('fastExecutionText')}</p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-amber-500 text-2xl border border-slate-100">
                            <FaBuilding />
                        </div>
                        <h4 className="font-bold text-slate-700">{t('govIntegration')}</h4>
                        <p className="text-xs text-slate-400">{t('govIntegrationText')}</p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
                <p className="text-sm font-medium text-blue-700">
                    © 2026 GMS Digital Governance Initiative. {t('rightsReserved')}
                </p>
            </div>
        </div>
    );
}

export default AboutUs;
