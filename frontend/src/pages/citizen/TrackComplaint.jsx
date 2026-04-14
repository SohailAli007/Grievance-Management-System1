import React, { useEffect, useState } from 'react';
import { getUserComplaints, API_BASE_URL } from '../../api/api.js';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext.jsx';

function TrackComplaint() {
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await getUserComplaints();
      if (data) {
        setComplaints(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();

    const es = new EventSource(`${API_BASE_URL}/events`);

    es.addEventListener('complaint_updated', (e) => {
      const data = JSON.parse(e.data);
      // We could filter here, but a general toast is fine for demo
      toast.success(`Complaint status updated to ${data.status}`, { icon: '🔔' });
      fetchComplaints();
    });

    es.addEventListener('complaint_closed', () => {
      toast.error('A complaint has been closed.');
      fetchComplaints();
    });

    return () => {
      es.close();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{t('trackComplaints')}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('viewStatusOfGrievances')}
          </p>
        </div>
        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-white text-slate-700 text-xs font-medium px-3 py-1.5 border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? t('loading') : t('refresh')}
        </button>
      </div>

      <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="hidden md:block">
          <table className="min-w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold">
              <tr>
                <th className="px-5 py-3 ml-1">{t('complaintId')}</th>
                <th className="px-5 py-3">{t('issueTitle')}</th>
                <th className="px-5 py-3">{t('status')}</th>
                <th className="px-5 py-3">{t('assignedOfficer')}</th>
                <th className="px-5 py-3">{t('updateDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.length > 0 ? complaints.slice(0, 10).map((c) => (
                <tr
                  key={c.id || c.complaintId}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedComplaint(c)}
                >
                  <td className="px-5 py-2.5 text-[11px] font-mono text-slate-500 group-hover:text-blue-600 transition-colors">{c.id || c.complaintId}</td>
                  <td className="px-5 py-2.5 text-xs font-bold text-slate-700">{c.title}</td>
                  <td className="px-5 py-2.5">
                    <span
                      className={`inline-flex items-center rounded-lg px-2 py-1 border text-[10px] font-black uppercase tracking-tight
                        ${c.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100'
                          : c.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : c.status === 'ASSIGNED'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm shadow-indigo-100'
                              : 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm shadow-blue-100'
                        }

                      `}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-[11px] font-medium text-slate-600">{c.assignedOfficerName || t('awaitingAllocation')}</td>
                  <td className="px-5 py-2.5 text-[11px] text-slate-400 font-medium">{new Date(c.updatedAt).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-slate-400 italic text-sm">{t('noComplaintsFound')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {complaints.slice(0, 8).map((c) => (
            <div
              key={c.complaintId || c.id}
              className="p-4 flex flex-col gap-1 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => setSelectedComplaint(c)}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">{c.complaintId || c.id}</span>
                <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase ${c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                  {c.status}
                </span>

              </div>
              <p className="text-xs font-bold text-slate-800">{c.title}</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[10px] text-slate-500 font-medium">{t('assignedOfficer')}: {c.assignedOfficerName || t('awaitingAllocation')}</p>
                <p className="text-[10px] text-slate-400">{new Date(c.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{t('complaintId')}: {selectedComplaint.id || selectedComplaint.complaintId}</p>
                <h3 className="text-xl font-bold text-slate-800">{selectedComplaint.title}</h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider transition-colors">{t('status')}</label>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border ${selectedComplaint.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                      }`}>
                      {selectedComplaint.status}
                    </span>

                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('department')}</label>
                  <p className="text-sm font-semibold text-slate-700">{selectedComplaint.department || 'General'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('location')}</label>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedComplaint.location || t('noLocationProvided')}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('descriptionDetails')}</label>
                <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-blue-200 pl-4 py-1">
                  {selectedComplaint.description || t('noDescriptionProvided')}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div>
                  <label className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">{t('assignedOfficer')}</label>
                  <p className="text-sm font-bold text-blue-700">{selectedComplaint.assignedOfficerName || t('awaitingAllocation')}</p>
                </div>
                <div className="text-right">
                  <label className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">{t('lastUpdate')}</label>
                  <p className="text-xs font-semibold text-blue-600">{new Date(selectedComplaint.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white shadow-sm transition-all"
              >
                {t('closeView')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackComplaint;
