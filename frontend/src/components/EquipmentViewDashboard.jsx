import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const CATEGORIES = [
  { id: 'All',                  label: 'All',            icon: '📋' },
  { id: 'Medical equipment',    label: 'Medical',        icon: '🩺' },
  { id: 'Electrical equipment', label: 'Electrical',     icon: '⚡' },
  { id: 'A/C & Refrigerator',   label: 'A/C & Fridge',   icon: '❄️' },
  { id: 'Generator',            label: 'Generator',      icon: '🔋' },
  { id: 'Furniture',            label: 'Furniture',      icon: '🪑' },
  { id: 'Photocopy',            label: 'Photocopy',      icon: '🖨️' },
  { id: 'IT',                   label: 'IT',             icon: '💻' },
  { id: 'Medical Furniture',    label: 'Med. Furniture', icon: '🛏️' }
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

// ── Institution Dropdown ────────────────────────────────────────────────────────
function InstitutionDropdown({ institutions, selected, onChange, accentFrom, accentTo }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = institutions.find(i => i.id === selected) || institutions[0];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2.5 min-w-[220px] justify-between px-4 py-2.5 rounded-xl text-sm font-semibold
                   transition shadow-sm hover:shadow-md
                   bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                   text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">🏥</span>
          <span className="truncate">{current.name}</span>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 w-72 rounded-2xl shadow-xl z-30 overflow-hidden
                        bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <div className="p-1.5 max-h-72 overflow-y-auto">
            {institutions.map(inst => {
              const isSelected = inst.id === selected;
              return (
                <button key={inst.id} onClick={() => { onChange(inst.id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                    ${isSelected
                      ? `bg-gradient-to-r ${accentFrom} ${accentTo} text-white`
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}>
                  <span className="text-base shrink-0">{inst.id === 'All' ? '📋' : '🏥'}</span>
                  <div className="text-left min-w-0 flex-1">
                    <p className="font-semibold text-xs truncate leading-tight">{inst.name}</p>
                    {inst.count !== undefined && (
                      <p className={`text-[10px] leading-tight ${isSelected ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                        {inst.count} record{inst.count !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────────
function EquipmentViewDashboard({ title, subtitle, accentFrom='from-indigo-500', accentTo='to-indigo-600', accentRing='focus:ring-indigo-400', accentBorder='focus:border-indigo-400' }) {
  const [equipments,        setEquipments]       = useState([]);
  const [activeFilter,      setActiveFilter]      = useState('All');
  const [activeInstitution, setActiveInstitution] = useState('All');
  const [searchTerm,        setSearchTerm]        = useState('');
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/equipment', { headers: { Authorization: `Bearer ${token}` } });
        setEquipments(res.data);
      } catch { setError('Failed to load equipment data. Please refresh.'); }
      finally   { setLoading(false); }
    };
    fetchData();
  }, []);

  const institutionList = [
    { id: 'All', name: 'All Institutions', count: equipments.length },
    ...Array.from(new Map(equipments.map(e => [e.institution?._id, e.institution])).values())
      .filter(Boolean)
      .map(i => ({ id: i._id, name: i.name, email: i.email, count: equipments.filter(e => e.institution?._id === i._id).length }))
      .sort((a, b) => b.count - a.count)
  ];

  const scopedEquipments = activeInstitution === 'All' ? equipments : equipments.filter(e => e.institution?._id === activeInstitution);

  const counts = CATEGORIES.slice(1).reduce((acc, c) => {
    acc[c.id] = scopedEquipments.filter(e => e.category === c.id).length;
    return acc;
  }, {});

  const filtered = equipments.filter(item => {
    const catOk  = activeFilter === 'All' || item.category === activeFilter;
    const instOk = activeInstitution === 'All' || item.institution?._id === activeInstitution;
    const term   = searchTerm.toLowerCase();
    const textOk = !term || item.institution?.name?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term) || item.name?.toLowerCase().includes(term) ||
      item.make?.toLowerCase().includes(term) || item.model?.toLowerCase().includes(term) ||
      item.serialNumber?.toLowerCase().includes(term);
    return catOk && instOk && textOk;
  });

  const selectedInstitutionName = institutionList.find(i => i.id === activeInstitution)?.name || 'All Institutions';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50
                    dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/30
                    transition-colors duration-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 text-transparent bg-clip-text bg-gradient-to-r ${accentFrom} ${accentTo}`}>View Only</p>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{title}</h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">{subtitle}</p>
          </div>
          {/* Search */}
          <div className="relative shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input type="text" placeholder="Search equipment…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className={`pl-9 pr-8 py-2.5 border rounded-xl text-sm w-64 outline-none transition-all shadow-sm
                bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700
                text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600
                ${accentRing} ${accentBorder} focus:shadow-md`} />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Equipment', value: equipments.length,         icon: '📦', color: 'text-slate-800 dark:text-white' },
            { label: 'Institutions',    value: institutionList.length - 1, icon: '🏥', color: 'text-slate-800 dark:text-white' },
            { label: 'Categories',      value: 8,                          icon: '🗂️', color: 'text-slate-800 dark:text-white' },
            { label: 'Showing',         value: filtered.length,            icon: '👁️', color: `text-transparent bg-clip-text bg-gradient-to-r ${accentFrom} ${accentTo}` }
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.label}</p>
                <span className="text-lg">{s.icon}</span>
              </div>
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter panel */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-4 mb-6">
          <div className="flex flex-col gap-4">

            {/* Institution row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">By Institution</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <InstitutionDropdown institutions={institutionList} selected={activeInstitution}
                  onChange={(id) => { setActiveInstitution(id); setActiveFilter('All'); }}
                  accentFrom={accentFrom} accentTo={accentTo} />
                {institutionList.slice(1, 5).map(inst => (
                  <button key={inst.id}
                    onClick={() => { setActiveInstitution(prev => prev === inst.id ? 'All' : inst.id); setActiveFilter('All'); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                      ${activeInstitution === inst.id
                        ? `bg-gradient-to-r ${accentFrom} ${accentTo} text-white border-transparent shadow-md`
                        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}>
                    🏥 {inst.name}
                    <span className={`text-[10px] ${activeInstitution === inst.id ? 'opacity-75' : 'opacity-50'}`}>({inst.count})</span>
                  </button>
                ))}
                {activeInstitution !== 'All' && (
                  <button onClick={() => setActiveInstitution('All')}
                    className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700/50" />

            {/* Category row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 shrink-0">
                <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">By Category</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => {
                  const active = activeFilter === cat.id;
                  const cnt = cat.id === 'All' ? scopedEquipments.length : (counts[cat.id] || 0);
                  return (
                    <button key={cat.id} onClick={() => setActiveFilter(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150
                        ${active
                          ? `bg-gradient-to-r ${accentFrom} ${accentTo} text-white border-transparent shadow-md scale-105`
                          : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-white dark:hover:bg-slate-700'
                        }`}>
                      <span>{cat.icon}</span>{cat.label}
                      <span className={`text-[10px] ${active ? 'opacity-75' : 'opacity-40'}`}>({cnt})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Active filter banner */}
        {(activeInstitution !== 'All' || activeFilter !== 'All') && (
          <div className="flex items-center gap-3 mb-4 px-4 py-2.5 rounded-xl
                          bg-indigo-50/60 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
            <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1">
              {activeInstitution !== 'All' && <span className="mr-2">Institution: <span className="font-bold">{selectedInstitutionName}</span></span>}
              {activeFilter !== 'All' && <span>Category: <span className="font-bold">{activeFilter}</span></span>}
              <span className="text-slate-400 dark:text-slate-500 ml-2">· {filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </p>
            <button onClick={() => { setActiveInstitution('All'); setActiveFilter('All'); }}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold flex items-center gap-1 transition">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all
            </button>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <svg className="animate-spin w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-slate-400 dark:text-slate-500 text-sm">Loading equipment data…</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-5 text-sm flex items-center gap-3">
            <span className="text-xl">⚠️</span> {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-100 dark:border-slate-700/50">
            <span className="text-5xl">🔍</span>
            <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm">No equipment found</p>
            <p className="text-xs text-slate-400 dark:text-slate-600">Try adjusting your filters or search term</p>
            <button onClick={() => { setActiveInstitution('All'); setActiveFilter('All'); setSearchTerm(''); }}
              className="mt-1 text-xs font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition">
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                {activeInstitution !== 'All' ? ` · ${selectedInstitutionName}` : ''}
                {activeFilter !== 'All' ? ` · ${activeFilter}` : ''}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-800/20">
                    {['#', 'Institution', 'Category', 'Equipment Details', 'Date', 'Book / Page'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, idx) => (
                    <tr key={item._id} className="border-b border-slate-50 dark:border-slate-700/30 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-4 text-slate-300 dark:text-slate-600 text-xs font-medium w-10">{idx + 1}</td>
                      <td className="px-5 py-4 min-w-[160px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm shrink-0">🏥</div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs leading-tight">{item.institution?.name || '—'}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{item.institution?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${CAT_BADGE[item.category] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${CAT_DOT[item.category] || 'bg-slate-400'}`} />
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 min-w-[190px]">
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

export default EquipmentViewDashboard;
