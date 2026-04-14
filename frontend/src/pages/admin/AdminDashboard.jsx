import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  getAnalytics, getAllComplaints, updateComplaintStatus, closeComplaint,
  getAllUsers, getDepartments, updateProfile,
  getLiveActivity, getUrgentCases, getOfficerPerformance
} from '../../api/api.js';
import toast from 'react-hot-toast';
import {
  FaHome, FaClipboardList, FaUsers, FaBuilding,
  FaChartBar, FaCog, FaBullhorn, FaSearch,
  FaEllipsisV, FaArrowRight, FaExclamationCircle,
  FaArrowDown, FaArrowUp, FaSignOutAlt,
  FaUser, FaHistory, FaUserShield, FaBars,
  FaMoon, FaSun, FaVolumeUp, FaVolumeMute, FaBell, FaLock, FaLanguage, FaClock, FaDatabase
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminDashboard.css';

// Components
import DashboardStats from './components/DashboardStats';
import ComplaintsTrend from './components/ComplaintsTrend';
import DepartmentPerformance from './components/DepartmentPerformance';
import UrgentAttention from './components/UrgentAttention';
import LiveActivityFeed from './components/LiveActivityFeed';
import MapHeatmap from './components/MapHeatmap';
import OfficerPerformance from './components/OfficerPerformance';
import QuickActions from './components/QuickActions';


function AdminDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard'); // 'dashboard', 'complaints', 'staff', 'departments'
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [deptsList, setDeptsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [viewProfileImage, setViewProfileImage] = useState(false);
  const fileInputRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '', // Default placeholder as not in user object
    location: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '+92 300 1234567',
        location: user.location || 'Headquarters, Block A'
      });
    }
  }, [user]);

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [adminSettings, setAdminSettings] = useState(() => {
    const saved = localStorage.getItem('adminSettings');
    return saved ? JSON.parse(saved) : {
      darkMode: false,
      language: 'English',
      notifications: {
        newComplaint: true,
        overdue: true,
        feedback: false
      },
      soundEnabled: true,
      autoLogout: '30m',
      twoFactor: false,
      emailReports: 'Weekly',
      autoBackup: 'Daily'
    };
  });

  useEffect(() => {
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
  }, [adminSettings]);

  const updateSetting = (key, value) => {
    setAdminSettings(prev => ({ ...prev, [key]: value }));
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} updated`);
  };

  const updateNestedSetting = (category, key, value) => {
    setAdminSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value }
    }));
    toast.success(`${key} setting changed`);
  };

  const handleProfileSave = async () => {
    try {
      const loadingToast = toast.loading("Saving profile...");
      await updateProfile(profileForm);
      updateUser(profileForm);
      toast.dismiss(loadingToast);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update failed", err);
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleProfilePicUpdate = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result;
        localStorage.setItem('adminAvatar', newAvatar);
        window.location.reload();
      };
      reader.readAsDataURL(file);
    }
  };

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const menuItems = [
    { icon: <FaUser />, label: 'My Profile', view: 'profile', color: 'text-blue-500' },
    { icon: <FaCog />, label: 'Admin Settings', view: 'settings', color: 'text-gray-500' },
    { icon: <FaHistory />, label: 'System Logs', view: 'logs', color: 'text-amber-500' },
    { icon: <FaEllipsisV />, label: 'Help & Support', view: 'help', color: 'text-green-500' },
  ];

  // Filters for Complaints
  const [filters, setFilters] = useState({
    department: 'All',
    status: 'All',
    startDate: '',
    endDate: ''
  });

  // NEW: State for enhanced analytics
  const [liveActivity, setLiveActivity] = useState([]);
  const [urgentCases, setUrgentCases] = useState([]);
  const [officerPerformance, setOfficerPerformance] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsData, complaintsData, activityData, urgentData, perfData] = await Promise.all([
        getAnalytics(),
        getAllComplaints(filters),
        getLiveActivity().catch(() => []),
        getUrgentCases().catch(() => []),
        getOfficerPerformance().catch(() => [])
      ]);
      setAnalytics(analyticsData);
      setComplaints(complaintsData);
      setLiveActivity(activityData);
      setUrgentCases(urgentData);
      setOfficerPerformance(perfData);

      // Fetch extra data based on active view
      if (view === 'staff') {
        const users = await getAllUsers();
        setUsersList(users);
      } else if (view === 'departments') {
        const depts = await getDepartments();
        setDeptsList(depts);
      }
    } catch (err) {
      console.error("Failed to fetch admin data", err);
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view, filters]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const DashboardView = () => {
    return (
      <div className="scrollable-view">
        <DashboardStats stats={analytics?.stats} />

        <div className="dashboard-grid">
          {/* Row 1: Trend & Dept */}
          <div className="grid-col-3">
            <ComplaintsTrend trendData={analytics?.charts?.trend} />
          </div>
          <div className="grid-col-1">
            <DepartmentPerformance depts={analytics?.charts?.department} />
          </div>

          {/* Row 2: Urgent, Map, Activity */}
          <div className="grid-col-1">
            <UrgentAttention cases={urgentCases} />
          </div>
          <div className="grid-col-1">
            <MapHeatmap />
          </div>
          <div className="grid-col-1">
            <LiveActivityFeed activities={liveActivity} />
          </div>
          <div className="grid-col-1">
            <QuickActions onAction={(a) => toast.success(`Action: ${a}`)} />
          </div>

          {/* Row 3: Officer Performance */}
          <div className="grid-col-4">
            <OfficerPerformance officers={officerPerformance} />
          </div>
        </div>
      </div>
    );
  };

  const StaffManagementView = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="dashboard-card p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Personnel Directorate</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Authorized Field & Administrative Staff</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-2">
          <FaUsers /> Register Authority
        </button>
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="text-left pb-4 font-black">Identity</th>
              <th className="text-left pb-4 font-black">Contact Interface</th>
              <th className="text-left pb-4 font-black">Security Clearance</th>
              <th className="text-left pb-4 font-black">Status</th>
              <th className="text-right pb-4 font-black">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {usersList.map((u, idx) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs uppercase shadow-sm">
                      {u.name.charAt(0)}
                    </div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{u.name}</span>
                  </div>
                </td>
                <td className="py-5 text-xs font-bold text-slate-500">{u.email}</td>
                <td className="py-5">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${u.role === 'ADMIN' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Operational</span>
                  </div>
                </td>
                <td className="py-5 text-right">
                  <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-100">Configure</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const DepartmentsView = () => {
    const list = deptsList.length > 0 ? deptsList : (analytics?.departments || []);
    return (
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="dashboard-card p-8 h-full flex flex-col">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Sector Oversight</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Geographical & Structural Domains</p>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-2">
            <FaBuilding /> Initialize Domain
          </button>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="text-left pb-4 font-black">Domain Designation</th>
                <th className="text-left pb-4 font-black">Performance Threshold (SLA)</th>
                <th className="text-right pb-4 font-black">Sovereignty Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {list.map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FaBuilding className="text-xs" />
                      </div>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{d.name}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[80%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{d.sla || d.slaHours} HR Response</span>
                    </div>
                  </td>
                  <td className="py-5 text-right">
                    <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-indigo-100">Audit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

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
            <h3 className="text-sm font-black uppercase tracking-tighter">Complaint Details - {complaint.id}</h3>
            <button onClick={onClose} className="text-white hover:opacity-70 transition-opacity">✕</button>
          </div>
          <div className="modal-body custom-scrollbar">
            <div className="grid grid-cols-2 gap-6">
              <div className="detail-row">
                <span className="detail-label">Title</span>
                <span className="detail-value font-black text-slate-800">{complaint.title}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className={`status-badge ${complaint.status === 'RESOLVED' ? 'status-resolved' : 'status-pending'}`}>
                  {complaint.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Citizen</span>
                <span className="detail-value font-bold">{complaint.citizen}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Category</span>
                <span className="detail-value font-bold uppercase text-[11px] tracking-tight">{complaint.category}</span>
              </div>
              <div className="detail-row col-span-2">
                <span className="detail-label">Description</span>
                <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 border border-slate-100 leading-relaxed font-medium">
                  {complaint.description}
                </div>
              </div>
              <div className="detail-row col-span-2">
                <span className="detail-label">Assigned To</span>
                <span className="detail-value font-black text-blue-600">{complaint.assignedTo || 'Not Assigned'}</span>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="px-6 py-2.5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors">Close</button>
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform" onClick={() => toast.success("Feature coming soon")}>Update Status</button>
          </div>
        </motion.div>
      </div>
    );
  };

  const ComplaintsView = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6"
      >
        <div className="dashboard-card p-8 flex flex-wrap items-end gap-6 bg-white/50 backdrop-blur-md">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-1">Sector Domain</label>
            <select name="department" value={filters.department} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-blue-500/5 transition-all outline-none">
              <option value="All">All Sectors</option>
              {analytics?.departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-1">Status Protocol</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-blue-500/5 transition-all outline-none">
              <option value="All">Full Spectrum</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="RESOLVED">Resolved Today</option>
              <option value="CLOSED">Finalized</option>
            </select>
          </div>
          <div className="flex gap-4 min-w-[300px]">
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-1">Start Phase</label>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-1">End Phase</label>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" />
            </div>
          </div>
          <button onClick={fetchData} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all hover:scale-105">
            Execute Scan
          </button>
        </div>

        <div className="dashboard-card p-0 overflow-hidden shadow-2xl border-none">
          <div className="max-h-[600px] overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 backdrop-blur-md z-10">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hash / ID</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subject</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vector</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Originator</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignee</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phase</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {complaints.length > 0 ? complaints.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-blue-600 tracking-tighter bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{c.id}</span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-xs font-black text-slate-800 uppercase tracking-tight">{c.title}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">{new Date().toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-xs font-bold text-slate-600">{c.citizen}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[9px] font-black border border-indigo-100 uppercase">{c.assignedTo?.charAt(0) || 'U'}</div>
                        <span className="text-xs font-bold text-slate-500">{c.assignedTo || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase border ${c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        c.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        className="text-white bg-slate-900 group-hover:bg-blue-600 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg transition-all"
                        onClick={() => setSelectedComplaint(c)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="text-center py-24">
                      <div className="flex flex-col items-center gap-2 opacity-30">
                        <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-300 animate-spin-slow" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4">Zero Matching Records</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  const ProfileView = () => (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto pb-10">
      <div className="dashboard-card overflow-hidden shadow-2xl border-none">
        <div className="h-48 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)]" />
          <div className="absolute -bottom-16 left-12 flex items-end gap-6">
            <div className="w-40 h-40 rounded-[2rem] border-[6px] border-[#f8fafc] bg-slate-200 flex items-center justify-center text-5xl text-slate-400 font-black overflow-hidden shadow-2xl group relative bg-white">
              {localStorage.getItem('adminAvatar') || user?.avatar ? (
                <img src={localStorage.getItem('adminAvatar') || user?.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'A'
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePicUpdate}
                className="hidden"
                accept="image/*"
              />
              <div
                className="absolute inset-0 bg-blue-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
                onClick={() => setViewProfileImage(true)}
              >
                <FaSearch className="text-white text-xl mb-1" />
                <span className="text-white text-[9px] font-black uppercase tracking-widest">Analyze</span>
              </div>
            </div>
            <button
              className="p-3 bg-blue-600 text-white rounded-xl shadow-xl hover:scale-110 transition-transform mb-4 border-4 border-[#f8fafc]"
              onClick={() => fileInputRef.current.click()}
            >
              <FaCog className="text-lg" />
            </button>
          </div>
        </div>
        <div className="pt-24 px-12 pb-12 bg-white">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{user?.name || "Admin User"}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100 uppercase tracking-widest">{user?.role || "MASTER AUTHORITY"}</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] animate-pulse">● System Online</span>
              </div>
            </div>
            <button
              className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-105 hover:bg-blue-700 transition-all"
              onClick={handleProfileSave}
            >
              Commit Changes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Primary Designation</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-black text-slate-800 uppercase text-xs"
                  value={profileForm.name}
                  onChange={handleProfileInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Transmission Address</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-600 text-xs"
                  value={profileForm.email}
                  onChange={handleProfileInputChange}
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Encryption Protocol (Role)</label>
                <input type="text" className="w-full px-5 py-4 rounded-2xl bg-slate-100/50 border border-slate-100 text-slate-400 font-black uppercase text-xs cursor-not-allowed opacity-60" defaultValue={user?.role || "ADMIN"} readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Operational Base</label>
                <input
                  type="text"
                  name="location"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-600 text-xs"
                  value={profileForm.location}
                  onChange={handleProfileInputChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const SettingsView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-10 pb-12">
      <div className="flex flex-col gap-1 items-center text-center">
        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">System Configuration</h2>
        <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase">Authorized Encryption & Protocol Standards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appearance & Preferences */}
        <div className="dashboard-card p-8 bg-white/50 backdrop-blur-md">
          <h3 className="flex items-center gap-3 text-sm font-black text-slate-800 uppercase tracking-tight mb-8 border-b border-slate-100 pb-4">
            <FaSun className="text-amber-500" /> Interface Protocols
          </h3>
          <div className="space-y-8">
            <div className="flex justify-between items-center group">
              <div>
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Chromatic Theme</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Toggle high-contrast dark encryption</p>
              </div>
              <button
                onClick={() => updateSetting('darkMode', !adminSettings.darkMode)}
                className={`toggle-btn shadow-lg transition-all ${adminSettings.darkMode ? 'active bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
              >
                {adminSettings.darkMode ? <FaMoon className="text-blue-400" /> : <FaSun className="text-amber-500" />}
                <span className="font-black text-[10px] uppercase tracking-widest ml-2">{adminSettings.darkMode ? 'Deep Mode' : 'Light Mode'}</span>
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Linguistic Pack</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Primary system dialect</p>
              </div>
              <div className="flex items-center gap-3">
                <FaLanguage className="text-blue-600" />
                <select
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                  value={adminSettings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                >
                  <option>English</option>
                  <option>Urdu</option>
                  <option>Arabic</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="dashboard-card p-8">
          <h3 className="flex items-center gap-3 text-sm font-black text-slate-800 uppercase tracking-tight mb-8 border-b border-slate-100 pb-4">
            <FaBell className="text-blue-600" /> Alert Subsystems
          </h3>
          <div className="space-y-6">
            {Object.keys(adminSettings.notifications).map(key => (
              <div className="flex justify-between items-center" key={key}>
                <div>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Synchronize {key.toLowerCase()} triggers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminSettings.notifications[key]}
                    onChange={(e) => updateNestedSetting('notifications', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Audio & Security */}
        <div className="dashboard-card p-8">
          <h3 className="flex items-center gap-3 text-sm font-black text-slate-800 uppercase tracking-tight mb-8 border-b border-slate-100 pb-4">
            <FaLock className="text-rose-600" /> Security Matrix
          </h3>
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Sonic Feed</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Authorized audio triggers</p>
              </div>
              <button
                onClick={() => updateSetting('soundEnabled', !adminSettings.soundEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border font-black text-[9px] uppercase tracking-widest ${adminSettings.soundEnabled ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-lg shadow-emerald-500/10' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
              >
                {adminSettings.soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                {adminSettings.soundEnabled ? 'Active Scan' : 'Silent'}
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Auto-Purge Session</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Inactivity threshold</p>
              </div>
              <select
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none"
                value={adminSettings.autoLogout}
                onChange={(e) => updateSetting('autoLogout', e.target.value)}
              >
                <option value="15m">15 Minutes</option>
                <option value="30m">30 Minutes</option>
                <option value="1h">01 Hour</option>
                <option value="4h">04 Hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* System & Reporting */}
        <div className="dashboard-card p-8">
          <h3 className="flex items-center gap-3 text-sm font-black text-slate-800 uppercase tracking-tight mb-8 border-b border-slate-100 pb-4">
            <FaDatabase className="text-indigo-600" /> Core Repository
          </h3>
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Data Synchronization</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Repository mirroring cycle</p>
              </div>
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 uppercase tracking-widest">Every 06 Hours</span>
            </div>
            <button className="w-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl shadow-xl hover:bg-black transition-colors">
              Initialize Full System Audit
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    if (loading && !analytics) return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Global Intelligence...</p>
      </div>
    );

    switch (view) {
      case 'dashboard': return <DashboardView />;
      case 'complaints': return <ComplaintsView />;
      case 'staff': return <StaffManagementView />;
      case 'departments': return <DepartmentsView />;
      case 'profile': return <ProfileView />;
      case 'settings': return <SettingsView />;
      case 'logs': return <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 shadow-sm"><h2 className="text-xl font-black mb-2 uppercase tracking-tight">System Logs</h2><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit trails and activity logs synchronized here.</p></div>;
      case 'help': return <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 shadow-sm"><h2 className="text-xl font-black mb-2 uppercase tracking-tight">Help & Support</h2><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manuals and support channels available 24/7.</p></div>;
      default: return <DashboardView />;
    }
  };

  return (
    <div className={`admin-layout-wrapper h-screen ${adminSettings.darkMode ? 'dark-mode' : ''}`}>
      <div className={`admin-layout h-full ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar */}
        <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-logo flex flex-col items-start !gap-0 !py-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/30">G</div>
              <span className="text-2xl font-black tracking-tighter">GMS</span>
            </div>
            <div className="text-[10px] font-black text-blue-400 tracking-[0.3em] uppercase opacity-80 pl-1">
              Admin Panel
            </div>
          </div>
          <nav className="admin-sidebar-nav">
            <div className={`admin-nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }}>
              <FaHome /> Home
            </div>
            <div className={`admin-nav-item ${view === 'complaints' ? 'active' : ''}`} onClick={() => { setView('complaints'); setIsSidebarOpen(false); }}>
              <FaClipboardList /> Complaints
            </div>
            <div className={`admin-nav-item ${view === 'staff' ? 'active' : ''}`} onClick={() => { setView('staff'); setIsSidebarOpen(false); }}>
              <FaUsers /> Staff Management
            </div>
            <div className={`admin-nav-item ${view === 'departments' ? 'active' : ''}`} onClick={() => { setView('departments'); setIsSidebarOpen(false); }}>
              <FaBuilding /> Departments
            </div>
            <div className="admin-nav-item" onClick={() => { toast.success("Reports coming soon"); setIsSidebarOpen(false); }}><FaChartBar /> Reports</div>
            <div className={`admin-nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => { setView('settings'); setIsSidebarOpen(false); }}>
              <FaCog /> Settings
            </div>
            <div className="admin-nav-item" onClick={() => { toast.success("Announcements coming soon"); setIsSidebarOpen(false); }}><FaBullhorn /> Announcements</div>
          </nav>
          {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
        </aside>

        <main className="admin-main">
          {/* Header - Blue Zone GMS style */}
          <header className="admin-header bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 !border-none text-white shadow-2xl">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={toggleSidebar}
              >
                <FaBars className="text-xl" />
              </button>
              <div className="admin-header-title !text-white opacity-90 font-black tracking-tighter uppercase text-sm">
                Operational Overview
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">System Live</span>
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <div
                  className="flex items-center gap-3 hover:bg-white/10 p-1 rounded-xl transition-all cursor-pointer group"
                  onClick={toggleDropdown}
                >
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-xs font-black tracking-tight text-white uppercase">
                      {user?.name || "System Admin"}
                    </span>
                    <span className="text-[9px] font-bold text-blue-200/70 uppercase tracking-widest">
                      Master Authority
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                    {localStorage.getItem('adminAvatar') || user?.avatar ? (
                      <img src={localStorage.getItem('adminAvatar') || user?.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-black text-white">{user?.name ? user.name.charAt(0).toUpperCase() : "A"}</span>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden ring-1 ring-slate-900/5 origin-top-right text-slate-800"
                      style={{ zIndex: 100 }}
                    >
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-inner overflow-hidden">
                          {localStorage.getItem('adminAvatar') || user?.avatar ? (
                            <img src={localStorage.getItem('adminAvatar') || user?.avatar} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            user?.name?.charAt(0) || 'A'
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{user?.name || "Admin User"}</h3>
                          <p className="text-xs text-slate-500 font-medium">{user?.email || "admin@gms.com"}</p>
                          <span className="inline-block px-2 py-0.5 mt-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Active</span>
                        </div>
                      </div>
                      <div className="py-2">
                        {menuItems.map((item, idx) => (
                          <div key={idx}>
                            <button
                              onClick={() => { setView(item.view); setIsDropdownOpen(false); }}
                              className="w-full text-left px-5 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                            >
                              <span className={`text-lg opacity-80 group-hover:opacity-100 transition-opacity ${item.color}`}>{item.icon}</span>
                              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{item.label}</span>
                            </button>
                            {(idx === 2) && <div className="h-px bg-slate-100 my-1 mx-4" />}
                          </div>
                        ))}
                      </div>
                      <div className="p-2 bg-slate-50 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors font-semibold text-sm"
                        >
                          <FaSignOutAlt /> Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          <div className="admin-content">
            <AnimatePresence mode="wait">
              <div key={view}>
                {renderContent()}
              </div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {selectedComplaint && <ComplaintDetailModal complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />}

      {/* Profile Image View Modal */}
      <AnimatePresence>
        {viewProfileImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setViewProfileImage(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full aspect-square bg-slate-800 rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 bg-black/20 rounded-full transition-colors z-10"
                onClick={() => setViewProfileImage(false)}
              >
                ✕
              </button>
              {localStorage.getItem('adminAvatar') || user?.avatar ? (
                <img
                  src={localStorage.getItem('adminAvatar') || user?.avatar}
                  alt="Profile Large"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl text-slate-500 font-bold bg-slate-900">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;
