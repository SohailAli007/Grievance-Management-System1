import React, { useState } from 'react';
import { FaQuestionCircle, FaHeadset, FaBook, FaCommentDots, FaChevronRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext.jsx';

function Support() {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');

    const faqs = [
        { q: "How do I track my complaint?", a: "Go to 'Track Complaints' in the sidebar or menu to see real-time updates." },
        { q: "Can I edit my name later?", a: "Name can be changed only once for security reasons. Contact us if you need further help." },
        { q: "What is the resolution time?", a: "Most complaints are resolved within 24-48 hours depending on priority." }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-blue-600 text-white">
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <FaHeadset /> {t('helpSupport')}
                    </h1>
                    <p className="text-blue-100 mt-1">{t('howToHelp')}</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* Quick Contact */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FaCommentDots className="text-blue-600" /> {t('sendMessage')}
                            </h3>
                            <textarea
                                placeholder={t('describeIssue')}
                                className="w-full rounded-xl border border-slate-200 p-4 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            ></textarea>
                            <button
                                onClick={() => {
                                    if (!query) return toast.error("Please type something");
                                    toast.success("Help request sent! We'll reply soon.");
                                    setQuery('');
                                }}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
                            >
                                {t('submitRequest')}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FaBook className="text-indigo-600" /> {t('resources')}
                            </h3>
                            <div className="space-y-2">
                                {['Tutorial Video', 'User Handbook', 'Safety Guidelines', 'Terms of Service'].map(item => (
                                    <button key={item} className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition text-sm text-slate-600 group">
                                        {item}
                                        <FaChevronRight className="text-slate-300 group-hover:text-blue-500 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="space-y-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 px-1">
                            <FaQuestionCircle className="text-amber-500" /> {t('faqs')}
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {faqs.map((faq, i) => (
                                <details key={i} className="group p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer overflow-hidden">
                                    <summary className="list-none flex justify-between items-center font-semibold text-slate-700 text-sm">
                                        {faq.q}
                                        <FaChevronRight className="transition-transform group-open:rotate-90 text-slate-400" />
                                    </summary>
                                    <p className="mt-3 text-sm text-slate-500 leading-relaxed border-t border-slate-200 pt-3">
                                        {faq.a}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default Support;
