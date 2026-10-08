import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

// ─── Equipment name lists from Excel ──────────────────────────────────────────
const EQUIPMENT_NAMES = {
  'Medical equipment': [
    '3 part Haematology Analyzer','5 part Haematology Analyzer','AED training unit',
    'Air Compressor','Air motor base','Air Rotor Hand piece','Ambu bag Adult',
    'Ambu bag Neonate','Ambu bag Pediatric','Anesthesia Machine','Adult weighting scale',
    'Adult weighing scale (beam)','Adult weight Scale with H.M.Rod','Autoscore',
    'Baby hanging scale','Baby Incubator','Baby weighing scale (beam)',
    'Baby weighing scale (Digital)','Bathroom Scale','Blood Gas Analyzer','CTG Machine',
    'Centrifuge','Cholesterol meter','Contra Angle Hand piece','Dental chair Unit',
    'Delivery Set','Diagnostic Set','Defibrillator','Digital Thermometer',
    'Distil water plant','ECG recorder','Electro Surgery unit','ENDO Micro motor',
    'Examination Torch','Featal Doppler','Fully Automated B.C. Analyzer','Glucometer',
    'Height measuring rod','Height measuring tape','Haemoglobin meter','Immuno Analyzer',
    'Infant warmer','Infusion Pump','Knee hammer','Lab Refrigerator','Laryngoscope',
    'Length measuring board','Length measuring mat','Light curing unit',
    'Mannequins with face mask','Measuring tape','Mega oxygen cylinder stand',
    'Microscope','Nebulizer','O.T. Bed','O.T. Lamp','Ophthalmoscope',
    'Oxygen cylinder medium','Oxygen Regulator','Patient Monitor','Patient Warmer',
    'Peak Flow Meter','Peak Flow Meter Digital','Photo Therapy unit',
    'Pinnard Foetal Stethoscope','Pulse Oximeter','Rapid Test Reader',
    'Semi-Automated B.C. Analyzer','Serum Electrolytes Analyzer',
    'Sphygmomanometer Digital','Sphygmomanometer Aneroid','Spectrophotometer',
    'Spot Lamp','Sterilizer Drum','Sterilizer','Stethoscope',
    'Suction Apparatus- Adult','Suction Apparatus - Paediatric','Syringe Pump',
    'Table Top Autoclave','UPS','Ultra Sonic Scaler','Vacuum Extractor','Ventilator',
    'X-Film processor','X-ray illuminator','X-ray machine','RO System',
    'Infant Red lamp / Infra Red Lamp','Pure sine Wave Inverter',
    'Fingertips Pulse oximeter','Spinal board','X ray Cassette','Incinerator',
    'Generator','Infra Red Lamp','X-ray Cassette','CR system','Snellen chart',
    'Infra red Thermometer',
  ],
  'Electrical equipment': [
    'Ceiling fan','Wall fan','Stand fan','Water pump','Laminating machine',
    'Sceler machine','TV','Kettle',
  ],
  'Furniture': [
    'Office Table / Clerical Table','Computer Table','Executive Table',
    'Conference Table','Steel Table','Wooden table','Plastic Table','Plastic Chair',
    'Cushion Chair','Arm Chair','Revolving Chair','Executive Chair','Steel Chair',
    'Wooden Chair','Glass front Almyrah','Steel Almyrah','Wooden Almyrah',
    'Steel Bed','Wooden Bed','Filling Cabinet','Book Shelve','Book Rack',
    'Stapler','Puncher','Calculator','Wood truck',
  ],
  'Photocopy': [
    'Roneo machine',
  ],
  'IT': [
    'Desktop','Laptop','Printer','UPS','Fax machine',
  ],
  'Medical Furniture': [
    'Baby cot Neonate','Bed side Locker','Bed side screen','BHT Trolly',
    'Delivery Bed','Dental Surgeon Stool','Dressing trolly','Emergency Drug Trolley',
    'ETO Bed','Examination Bed','Food trolly','Hospital Bed','Injection Trolly',
    'Instrument trolly','Laboratory chair','Lithotomy Bed','Mayo Trolley',
    'Medicine cupboard','Medicine Racks','Medicine Trolly (Drug)','OPD Chair',
    'Operating Trolley','Oxygen Cylinder Cart','Oxygen cylinder stand -small',
    'Patient Stool','Patient Trolly','Post-Natal Bed Adjustable','Revolving Stool',
    'Saline stand (IV Stand)','Surgeon Stool','Wheel chair',
  ],
};

// ─── Searchable name dropdown ──────────────────────────────────────────────────
function NameDropdown({ options, value, onChange, gradient, inputCls }) {
  const [query, setQuery]   = useState(value || '');
  const [open, setOpen]     = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);

  // Sync external value → local query (e.g. form reset)
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

  const select = (name) => {
    setQuery(name);
    onChange(name);
    setOpen(false);
  };

  const handleInput = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value); // allow free-type too
    setOpen(true);
  };

  return (
    <div ref={wrapRef} className="relative col-span-2">
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
        Equipment Name <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => { setOpen(true); setFocused(true); }}
          onBlur={() => setFocused(false)}
          required
          placeholder="Type or select equipment name…"
          className={`${inputCls} pr-9`}
        />
        {/* chevron */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen(p => !p)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Dropdown list */}
      {open && filtered.length > 0 && (
        <div className="absolute z-40 mt-1.5 w-full max-h-56 overflow-y-auto
                        bg-white dark:bg-slate-800 rounded-2xl shadow-xl
                        border border-slate-100 dark:border-slate-700">
          {filtered.map(name => (
            <button
              key={name}
              type="button"
              onMouseDown={() => select(name)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                          hover:bg-slate-50 dark:hover:bg-slate-700
                          text-slate-700 dark:text-slate-200
                          ${name === query ? `font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent` : ''}`}
            >
              {name}
            </button>
          ))}
          {/* allow adding a custom name not in list */}
          {query && !options.find(o => o.toLowerCase() === query.toLowerCase()) && (
            <button
              type="button"
              onMouseDown={() => select(query)}
              className="w-full text-left px-4 py-2.5 text-sm text-indigo-500 dark:text-indigo-400
                         hover:bg-indigo-50 dark:hover:bg-slate-700 font-medium border-t border-slate-100 dark:border-slate-700"
            >
              + Use "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'Medical equipment',    label: 'Medical Equipment',    icon: '🩺',
    gradient: 'from-rose-500 to-red-600',
    soft: 'bg-rose-50 border-rose-200 text-rose-700',
    activeSoft: 'bg-rose-100 border-rose-400',
    darkSoft: 'dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300',
    shadow: 'shadow-rose-100',
    fields: ['name', 'make', 'model', 'serialNumber'],
    hasNameDropdown: true,
  },
  {
    id: 'Electrical equipment', label: 'Electrical Equipment', icon: '⚡',
    gradient: 'from-amber-400 to-yellow-500',
    soft: 'bg-amber-50 border-amber-200 text-amber-700',
    activeSoft: 'bg-amber-100 border-amber-400',
    darkSoft: 'dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300',
    shadow: 'shadow-amber-100',
    fields: ['name', 'make', 'model', 'serialNumber'],
    hasNameDropdown: true,
  },
  {
    id: 'A/C & Refrigerator',   label: 'A/C & Refrigerator',  icon: '❄️',
    gradient: 'from-sky-400 to-cyan-500',
    soft: 'bg-sky-50 border-sky-200 text-sky-700',
    activeSoft: 'bg-sky-100 border-sky-400',
    darkSoft: 'dark:bg-sky-500/10 dark:border-sky-500/30 dark:text-sky-300',
    shadow: 'shadow-sky-100',
    fields: ['make', 'model', 'serialNumber', 'capacity'],
    hasNameDropdown: false,
    capacityLabel: 'Capacity (BTU / Ton)',
    capacityPlaceholder: 'e.g. 12000 BTU or 1.5 Ton',
  },
  {
    id: 'Generator',            label: 'Generator',            icon: '🔋',
    gradient: 'from-orange-400 to-orange-500',
    soft: 'bg-orange-50 border-orange-200 text-orange-700',
    activeSoft: 'bg-orange-100 border-orange-400',
    darkSoft: 'dark:bg-orange-500/10 dark:border-orange-500/30 dark:text-orange-300',
    shadow: 'shadow-orange-100',
    fields: ['make', 'model', 'serialNumber', 'capacity'],
    hasNameDropdown: false,
    capacityLabel: 'Capacity (kVA / kW)',
    capacityPlaceholder: 'e.g. 25 kVA or 20 kW',
  },
  {
    id: 'Furniture',            label: 'Furniture',            icon: '🪑',
    gradient: 'from-lime-500 to-green-600',
    soft: 'bg-lime-50 border-lime-200 text-lime-700',
    activeSoft: 'bg-lime-100 border-lime-400',
    darkSoft: 'dark:bg-lime-500/10 dark:border-lime-500/30 dark:text-lime-300',
    shadow: 'shadow-lime-100',
    fields: ['name', 'count'],
    hasNameDropdown: true,
  },
  {
    id: 'Photocopy',            label: 'Photocopy',            icon: '🖨️',
    gradient: 'from-purple-500 to-violet-600',
    soft: 'bg-purple-50 border-purple-200 text-purple-700',
    activeSoft: 'bg-purple-100 border-purple-400',
    darkSoft: 'dark:bg-purple-500/10 dark:border-purple-500/30 dark:text-purple-300',
    shadow: 'shadow-purple-100',
    fields: ['name', 'make', 'model', 'serialNumber'],
    hasNameDropdown: true,
  },
  {
    id: 'IT',                   label: 'IT Equipment',         icon: '💻',
    gradient: 'from-indigo-500 to-blue-600',
    soft: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    activeSoft: 'bg-indigo-100 border-indigo-400',
    darkSoft: 'dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-300',
    shadow: 'shadow-indigo-100',
    fields: ['name', 'make', 'model', 'serialNumber'],
    hasNameDropdown: true,
  },
  {
    id: 'Medical Furniture',    label: 'Medical Furniture',    icon: '🛏️',
    gradient: 'from-teal-500 to-emerald-600',
    soft: 'bg-teal-50 border-teal-200 text-teal-700',
    activeSoft: 'bg-teal-100 border-teal-400',
    darkSoft: 'dark:bg-teal-500/10 dark:border-teal-500/30 dark:text-teal-300',
    shadow: 'shadow-teal-100',
    fields: ['name', 'count'],
    hasNameDropdown: true,
  },
];

// ─── Field config for non-name fields ──────────────────────────────────────────
const FIELD_CONFIG = {
  make:         { label: 'Make',          placeholder: 'e.g. Philips',       type: 'text'   },
  model:        { label: 'Model',         placeholder: 'e.g. MX750',         type: 'text'   },
  serialNumber: { label: 'Serial Number', placeholder: 'e.g. SN-2024-001',   type: 'text'   },
  count:        { label: 'Count',         placeholder: 'e.g. 10',           type: 'number' },
};

const EMPTY_FORM = {
  date: '', book: '', pageNumber: '',
  name: '', make: '', model: '', serialNumber: '', count: '', capacity: ''
};

// ─── Main component ────────────────────────────────────────────────────────────
function AddEquipment() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dragOver, setDragOver]                 = useState(false);
  const [formData, setFormData]                 = useState(EMPTY_FORM);
  const [status, setStatus]                     = useState({ type: '', message: '' });
  const [saving, setSaving]                     = useState(false);
  const formRef = useRef(null);

  const selectCategory = (cat) => {
    setSelectedCategory(cat);
    setFormData(EMPTY_FORM);
    setStatus({ type: '', message: '' });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleDragStart = (e, catId) => { e.dataTransfer.setData('categoryId', catId); e.dataTransfer.effectAllowed = 'copy'; };
  const handleDragOver  = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = ()  => setDragOver(false);
  const handleDrop      = (e) => {
    e.preventDefault(); setDragOver(false);
    const cat = CATEGORIES.find(c => c.id === e.dataTransfer.getData('categoryId'));
    if (cat) selectCategory(cat);
  };

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleNameChange = (val) =>
    setFormData(prev => ({ ...prev, name: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      const payload = {
        category:   selectedCategory.id,
        date:       formData.date,
        book:       formData.book,
        pageNumber: formData.pageNumber,
      };

      // include each field if filled
      ['name', 'make', 'model', 'serialNumber', 'count', 'capacity'].forEach(f => {
        if (formData[f] !== '' && formData[f] !== undefined) payload[f] = formData[f];
      });

      await api.post('/api/equipment/add', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStatus({ type: 'success', message: 'Equipment added successfully! Redirecting…' });
      setFormData(EMPTY_FORM);
      setSelectedCategory(null);
      setTimeout(() => navigate('/institution-dashboard'), 1500);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to add equipment.' });
      setSaving(false);
    }
  };

  const activeCat = selectedCategory;

  const inputCls = `w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-all
    bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700
    text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600
    hover:bg-white dark:hover:bg-slate-800
    focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30
                    dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 transition-colors duration-200">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Page header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/institution-dashboard')}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition shadow-sm
                       bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                       hover:bg-slate-50 dark:hover:bg-slate-700">
            <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600
                            flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Add New Equipment</h1>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                Select a category, fill the form, and save
              </p>
            </div>
          </div>
        </div>

        {/* ── Toast ── */}
        {status.message && (
          <div className={`flex items-center gap-3 mb-6 px-4 py-3.5 rounded-2xl text-sm font-medium border ${
            status.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
              : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
          }`}>
            <span>{status.type === 'success' ? '✅' : '❌'}</span>
            {status.message}
            {status.type === 'error' && (
              <button onClick={() => setStatus({ type: '', message: '' })} className="ml-auto opacity-40 hover:opacity-100 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8">

          {/* ── LEFT: Category cards ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Equipment Categories
              </p>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                Click or Drag
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(cat => {
                const isActive = activeCat?.id === cat.id;
                return (
                  <div
                    key={cat.id}
                    draggable
                    onDragStart={e => handleDragStart(e, cat.id)}
                    onClick={() => selectCategory(cat)}
                    className={`group relative cursor-pointer select-none rounded-2xl border-2 p-4
                                transition-all duration-200 hover:scale-[1.03] hover:shadow-lg active:scale-[0.97]
                                ${isActive
                                  ? `${cat.activeSoft} ${cat.darkSoft} shadow-lg ${cat.shadow} scale-[1.03]`
                                  : `${cat.soft} ${cat.darkSoft} hover:shadow-md`
                                }`}
                  >
                    {isActive && (
                      <div className={`absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-sm`}>
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-xl shadow-sm mb-3 transition-transform group-hover:scale-110`}>
                      {cat.icon}
                    </div>
                    <p className="text-xs font-bold leading-snug">{cat.label}</p>
                    <p className="text-[10px] mt-1 opacity-50 leading-relaxed">
                      {cat.hasNameDropdown ? 'name dropdown' : cat.id === 'A/C & Refrigerator' || cat.id === 'Generator' ? 'capacity' : ''}
                      {cat.fields.filter(f => f !== 'name' && f !== 'capacity').join(' · ')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: Drop zone / Form ── */}
          <div ref={formRef}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Entry Form</p>
              {activeCat && (
                <button
                  onClick={() => { setSelectedCategory(null); setFormData(EMPTY_FORM); }}
                  className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                  Change
                </button>
              )}
            </div>

            {/* Drop zone */}
            {!activeCat ? (
              <div
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl flex flex-col items-center justify-center py-24 transition-all duration-200
                  ${dragOver
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 scale-[1.01]'
                    : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
              >
                <div className={`text-5xl mb-4 transition-transform duration-200 ${dragOver ? 'scale-125' : ''}`}>
                  {dragOver ? '📂' : '📋'}
                </div>
                <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm">
                  {dragOver ? 'Release to select' : 'Drag a category here'}
                </p>
                <p className="text-slate-400 dark:text-slate-600 text-xs mt-1.5">or click any card on the left</p>
              </div>
            ) : (
              <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>

                {/* Category banner */}
                <div className={`rounded-2xl bg-gradient-to-r ${activeCat.gradient} p-4 mb-4 flex items-center gap-3 shadow-lg ${activeCat.shadow}`}>
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
                    {activeCat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{activeCat.label}</p>
                    <p className="text-white/70 text-xs mt-0.5">
                      {activeCat.hasNameDropdown ? 'Searchable name list · ' : ''}
                      {activeCat.id === 'A/C & Refrigerator' || activeCat.id === 'Generator' ? 'Capacity · ' : ''}
                      Make · Model · Serial
                      {activeCat.fields.includes('count') ? ' · Count' : ''}
                    </p>
                  </div>
                </div>

                {/* Form card */}
                <form
                  onSubmit={handleSubmit}
                  className="bg-white dark:bg-slate-800/70 rounded-3xl border border-slate-100 dark:border-slate-700/50 p-5 shadow-md space-y-5"
                >
                  {/* Register details */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                      Register Details
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: 'date',       label: 'Date',     type: 'date', placeholder: '' },
                        { name: 'book',       label: 'Book No.', type: 'text', placeholder: 'B-01' },
                        { name: 'pageNumber', label: 'Page No.', type: 'text', placeholder: '42' }
                      ].map(f => (
                        <div key={f.name}>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                            {f.label} <span className="text-red-400">*</span>
                          </label>
                          <input
                            type={f.type} name={f.name} value={formData[f.name]}
                            onChange={handleChange} required placeholder={f.placeholder}
                            className={inputCls}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-700/50" />

                  {/* Equipment details */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                      Equipment Details
                    </p>
                    <div className="grid grid-cols-2 gap-3">

                      {/* Name — searchable dropdown if category has name list */}
                      {activeCat.fields.includes('name') && (
                        activeCat.hasNameDropdown && EQUIPMENT_NAMES[activeCat.id] ? (
                          <NameDropdown
                            options={EQUIPMENT_NAMES[activeCat.id]}
                            value={formData.name}
                            onChange={handleNameChange}
                            gradient={activeCat.gradient}
                            inputCls={inputCls}
                          />
                        ) : (
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                              Equipment Name <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text" name="name" value={formData.name}
                              onChange={handleChange} required
                              placeholder="Enter equipment name"
                              className={inputCls}
                            />
                          </div>
                        )
                      )}

                      {/* Capacity — only for A/C & Refrigerator and Generator */}
                      {activeCat.fields.includes('capacity') && (
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                            {activeCat.capacityLabel} <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text" name="capacity" value={formData.capacity}
                            onChange={handleChange} required
                            placeholder={activeCat.capacityPlaceholder}
                            className={inputCls}
                          />
                        </div>
                      )}

                      {/* Make / Model / Serial / Count */}
                      {activeCat.fields
                        .filter(f => f !== 'name' && f !== 'capacity')
                        .map(fieldKey => {
                          const cfg = FIELD_CONFIG[fieldKey];
                          return (
                            <div key={fieldKey}>
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                                {cfg.label} <span className="text-red-400">*</span>
                              </label>
                              <input
                                type={cfg.type} name={fieldKey} value={formData[fieldKey]}
                                onChange={handleChange} required placeholder={cfg.placeholder}
                                min={fieldKey === 'count' ? 1 : undefined}
                                className={inputCls}
                              />
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => navigate('/institution-dashboard')}
                      className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600
                                 text-slate-600 dark:text-slate-300 font-semibold py-2.5 rounded-2xl transition text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className={`flex-[2] bg-gradient-to-r ${activeCat.gradient} disabled:opacity-50
                                  text-white font-bold py-2.5 rounded-2xl transition-all shadow-lg ${activeCat.shadow}
                                  hover:opacity-90 active:scale-[0.98] text-sm flex items-center justify-center gap-2`}
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Saving…
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          Add {activeCat.label}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEquipment;
