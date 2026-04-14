import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOfficerComplaints, updateComplaintStatus, API_BASE_URL } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

function OfficerDashboard() {
  const { department } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  // Convert URL slug to readable department name
  const getDeptDisplayName = (slug) => {
    if (!slug) return 'General';
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Create department slug from department name
  const getDeptSlug = (deptName) => {
    if (!deptName) return 'general';
    return deptName.toLowerCase().replace(/\s+/g, '-');
  };

  // Redirect to department-specific URL if at base /officer path
  useEffect(() => {
    if (!department && user?.departmentName) {
      const deptSlug = getDeptSlug(user.departmentName);
      navigate(`/officer/${deptSlug}`, { replace: true });
    }
  }, [department, user?.departmentName, navigate]);

  // Use URL param or fall back to user's department from auth context
  const deptName = getDeptDisplayName(department || user?.departmentName);

  const fetchComplaints = async () => {
    try {
      const data = await getOfficerComplaints();
      if (data) setComplaints(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComplaints();

    const es = new EventSource(`${API_BASE_URL}/events`);

    es.addEventListener('complaint_created', () => {
      // Officers only care if it's potentially for them, but usually they'll see it if it's unassigned
      toast('🔔 New Complaint in the system', { duration: 4000 });
      fetchComplaints();
    });

    es.addEventListener('complaint_updated', (e) => {
      const data = JSON.parse(e.data);
      toast.success(`Complaint ${data.complaintId} was updated!`, { icon: '📝' });
      fetchComplaints();
    });

    es.addEventListener('complaint_closed', () => {
      toast.error('📁 A complaint has been officially closed.');
      fetchComplaints();
    });

    return () => {
      es.close();
    };
  }, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    const prev = complaints;
    setComplaints((p) => p.map((c) => (c.id === id ? { ...c, status } : c)));
    try {
      await updateComplaintStatus(id, { status });
    } catch (err) {
      console.error(err);
      setComplaints(prev);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{deptName} Department Portal</h2>
          <p className="text-xs text-slate-500 mt-1">View and update complaints for {deptName} department.</p>
        </div>
        <button
          onClick={fetchComplaints}
          className="inline-flex items-center justify-center rounded-md bg-white text-slate-700 text-xs font-medium px-3 py-1.5 border border-slate-200 shadow-sm hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Citizen</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Last Updated</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id} className="border-b last:border-b-0 border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-2 text-xs font-mono text-slate-600">{c.id}</td>
                  <td className="px-4 py-2 text-sm text-slate-800">{c.title}</td>
                  <td className="px-4 py-2 text-xs text-slate-700">{c.citizen}</td>
                  <td className="px-4 py-2 text-xs">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 border text-[11px]
                        ${c.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : c.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : c.status === 'ASSIGNED'
                              ? 'bg-violet-50 text-violet-700 border-violet-200'
                              : c.status === 'PENDING' || c.status === 'SUBMITTED'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                        }
                      `}
                    >
                      {c.status}
                    </span>

                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">{c.lastUpdated}</td>
                  <td className="px-4 py-2 text-xs text-right space-x-1">
                    {(c.status === 'PENDING' || c.status === 'SUBMITTED') ? (
                      <button
                        onClick={() => handleStatusChange(c.id, 'ASSIGNED')}
                        className="px-2 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        Claim
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(c.id, 'IN_PROGRESS')}
                        className="px-2 py-1 rounded-md border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      >
                        Start Work
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusChange(c.id, 'RESOLVED')}
                      className="px-2 py-1 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    >
                      {updatingId === c.id ? 'Saving...' : 'Mark Resolved'}
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OfficerDashboard;
