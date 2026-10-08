import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CATEGORIES = [
  { id: 'Medical equipment',    label: 'Medical Equipment',    icon: '🩺' },
  { id: 'Electrical equipment', label: 'Electrical Equipment', icon: '⚡' },
  { id: 'A/C & Refrigerator',   label: 'A/C & Refrigerator',  icon: '❄️' },
  { id: 'Generator',            label: 'Generator',           icon: '🔋' },
  { id: 'Furniture',            label: 'Furniture',           icon: '🪑' },
  { id: 'Photocopy',            label: 'Photocopy',           icon: '🖨️' },
  { id: 'IT',                   label: 'IT Equipment',        icon: '💻' },
  { id: 'Medical Furniture',    label: 'Medical Furniture',   icon: '🛏️' }
];



const CAT_BADGE = {
  'Medical equipment':    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
  'Electrical equipment': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
  'A/C & Refrigerator':   'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20',
  'Generator':            'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20',
  'Furniture':            'bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-500/10 dark:text-lime-300 dark:border-lime-500/20',
  'Photocopy':            'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20',
  'IT':                   'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20',
  'Medical Furniture':    'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20'
};

const CAT_DOT = {
  'Medical equipment': 'bg-rose-400', 'Electrical equipment': 'bg-amber-400',
  'A/C & Refrigerator': 'bg-sky-400', 'Generator': 'bg-orange-400',
  'Furniture': 'bg-lime-400', 'Photocopy': 'bg-purple-400',
  'IT': 'bg-indigo-400', 'Medical Furniture': 'bg-teal-400'
};

const CAT_GRADIENT = {
  'Medical equipment': 'from-rose-500 to-red-600', 'Electrical equipment': 'from-amber-400 to-yellow-500',
  'A/C & Refrigerator': 'from-sky-400 to-cyan-500', 'Generator': 'from-orange-400 to-orange-500',
  'Furniture': 'from-lime-500 to-green-600', 'Photocopy': 'from-purple-500 to-violet-600',
  'IT': 'from-indigo-500 to-blue-600', 'Medical Furniture': 'from-teal-500 to-emerald-600'
};

function InstitutionDashboard() {
  const navigate = useNavigate();
  const [equipments,   setEquipments]   = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm,   setSearchTerm]   = useState('');
  const [loading,      setLoading]      = useState(true);

  const fetchEquipments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/equipment', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipments(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEquipments(); }, [fetchEquipments]);

  const filtered = equipments.filter(item => {
    const catOk = activeFilter === 'All' || item.category === activeFilter;
    const term  = searchTerm.toLowerCase();
    const textOk = !term || item.category?.toLowerCase().includes(term) ||
      item.name?.toLowerCase().includes(term) || item.make?.toLowerCase().includes(term) ||
      item.model?.toLowerCase().includes(term) || item.serialNumber?.toLowerCase().includes(term) ||
      item.book?.toLowerCase().includes(term);
    return catOk && textOk;
  });

  const counts = CATEGORIES.reduce((acc, c) => {
    acc[c.id] = equipments.filter(e => e.category === c.id).length;
    return acc;
  }, {});

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  /* shared input class */
  const inputCls = `w-full border rounded-xl px-3 py-2 text-sm outline-none transition-all
    bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700
    text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600
    hover:bg-white dark:hover:bg-slate-800
    focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30
                    dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30
                    transition-colors duration-200">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">Institution Dashboard</p>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{user.name || 'My Equipment'}</h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Manage and view all equipment records</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search equipment…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 py-2.5 border rounded-xl text-sm w-52 outline-none transition shadow-sm
                           bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700
                           text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600
                           focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Upload Excel button */}
            <button onClick={() => navigate('/upload-equipment')}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700
                         text-emerald-600 dark:text-emerald-400 font-bold px-4 py-2.5
                         rounded-xl border border-emerald-200 dark:border-emerald-500/30
                         shadow-sm hover:shadow-md active:scale-[0.97] transition-all text-sm whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload Excel
            </button>

            {/* Add Equipment button */}
            <button onClick={() => navigate('/add-equipment')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600
                         hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-5 py-2.5
                         rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40
                         active:scale-[0.97] transition-all text-sm whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Equipment
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Equipment', value: equipments.length, icon: '📦', color: 'text-slate-800 dark:text-white' },
            { label: 'Categories Used', value: new Set(equipments.map(e => e.category)).size, icon: '🗂️', color: 'text-slate-800 dark:text-white' },
            { label: 'Showing',         value: filtered.length,   icon: '👁️', color: 'text-indigo-600 dark:text-indigo-400' },            { label: 'Latest Entry',
              value: equipments.length > 0
                ? new Date(equipments[0].createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
                : '—',
              icon: '📅', color: 'text-slate-800 dark:text-white', small: true }
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.label}</p>
                <span className="text-lg">{s.icon}</span>
              </div>
              <p className={`font-extrabold ${s.small ? 'text-xl' : 'text-3xl'} ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Category summary tiles — click to filter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-8">
          {CATEGORIES.map(cat => {
            const isActive = activeFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(prev => prev === cat.id ? 'All' : cat.id)}
                className={`rounded-2xl p-3 border-2 text-center transition-all duration-150 hover:scale-[1.04] active:scale-[0.97]
                  ${isActive
                    ? `bg-gradient-to-br ${CAT_GRADIENT[cat.id]} border-transparent shadow-md`
                    : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-md'
                  }`}
              >
                <div className="text-xl mb-1">{cat.icon}</div>
                <p className={`text-[10px] font-bold leading-snug ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {cat.label.replace(' Equipment', '').replace('Medical ', 'Med. ')}
                </p>
                <p className={`text-xs font-extrabold mt-1 ${
                  isActive
                    ? 'text-white'
                    : counts[cat.id] > 0
                      ? `bg-gradient-to-br ${CAT_GRADIENT[cat.id]} bg-clip-text text-transparent`
                      : 'text-slate-400 dark:text-slate-600'
                }`}>
                  {counts[cat.id] || 0}
                </p>
              </button>
            );
          })}
        </div>



        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <svg className="animate-spin w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-slate-400 text-sm">Loading your equipment…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4
                          bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-100 dark:border-slate-700/50">
            <span className="text-6xl">{equipments.length === 0 ? '📭' : '🔍'}</span>
            <div className="text-center">
              <p className="font-bold text-slate-600 dark:text-slate-300 text-base">
                {equipments.length === 0 ? 'No equipment added yet' : 'No results found'}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                {equipments.length === 0 ? 'Click "Add Equipment" to get started' : 'Try changing filter or search'}
              </p>
            </div>
            {equipments.length === 0 && (
              <button onClick={() => navigate('/add-equipment')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold
                           px-5 py-2.5 rounded-xl text-sm shadow-md transition active:scale-[0.98]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Equipment
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                {activeFilter !== 'All' ? ` · ${activeFilter}` : ''}
              </p>
              <button onClick={() => navigate('/add-equipment')}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400
                           hover:text-indigo-700 dark:hover:text-indigo-300
                           bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20
                           px-3 py-1.5 rounded-lg transition">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Equipment
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50">
                    {['#', 'Category', 'Equipment Details', 'Date', 'Book / Page'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, idx) => (
                    <tr key={item._id} className="border-b border-slate-50 dark:border-slate-700/30 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-4 text-slate-300 dark:text-slate-600 text-xs font-medium w-8">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${CAT_BADGE[item.category] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${CAT_DOT[item.category] || 'bg-slate-400'}`} />
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 min-w-[200px]">
                        <div className="space-y-0.5">
                          {item.name         && <div className="text-xs"><span className="text-slate-400 dark:text-slate-500">Name     </span><span className="text-slate-700 dark:text-slate-200 font-semibold">{item.name}</span></div>}
                          {item.capacity     && <div className="text-xs"><span className="text-slate-400 dark:text-slate-500">Capacity </span><span className="text-slate-700 dark:text-slate-200 font-semibold">{item.capacity}</span></div>}
                          {item.make         && <div className="text-xs"><span className="text-slate-400 dark:text-slate-500">Make     </span><span className="text-slate-700 dark:text-slate-300">{item.make}</span></div>}
                          {item.model        && <div className="text-xs"><span className="text-slate-400 dark:text-slate-500">Model    </span><span className="text-slate-700 dark:text-slate-300">{item.model}</span></div>}
                          {item.serialNumber && <div className="text-xs"><span className="text-slate-400 dark:text-slate-500">Serial   </span><span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">{item.serialNumber}</span></div>}
                          {(item.count !== undefined && item.count !== null && item.count !== '') &&
                            <div className="text-xs"><span className="text-slate-400 dark:text-slate-500">Count    </span><span className="text-slate-700 dark:text-slate-200 font-bold">{item.count}</span></div>}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5 text-xs text-slate-500 dark:text-slate-500">
                          <div>Book <span className="font-semibold text-slate-700 dark:text-slate-300">{item.book}</span></div>
                          <div>Pg <span className="font-semibold text-slate-700 dark:text-slate-300">{item.pageNumber}</span></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InstitutionDashboard;
