import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

// ── Valid categories (must match backend exactly) ──────────────────────────────
const VALID_CATEGORIES = [
  'Medical equipment',
  'Electrical equipment',
  'A/C & Refrigerator',
  'Generator',
  'Furniture',
  'Photocopy',
  'IT',
  'Medical Furniture',
];

// ── Column headers expected in Excel ──────────────────────────────────────────
// Row 1 = header, Row 2+ = data
const COLUMNS = [
  { key: 'category',     label: 'Category',      required: true,  example: 'Medical equipment'  },
  { key: 'name',         label: 'Name',           required: false, example: 'Ventilator'         },
  { key: 'make',         label: 'Make',           required: false, example: 'Philips'            },
  { key: 'model',        label: 'Model',          required: false, example: 'MX750'              },
  { key: 'serialNumber', label: 'Serial Number',  required: false, example: 'SN-2024-001'        },
  { key: 'count',        label: 'Count',          required: false, example: '5'                  },
  { key: 'capacity',     label: 'Capacity',       required: false, example: '1.5 Ton'            },
  { key: 'date',         label: 'Date',           required: true,  example: '2024-01-15'         },
  { key: 'book',         label: 'Book No',        required: true,  example: 'B-01'               },
  { key: 'pageNumber',   label: 'Page No',        required: true,  example: '42'                 },
];

// ── Download sample Excel template ────────────────────────────────────────────
function downloadTemplate() {
  const headerRow = COLUMNS.map(c => c.label);

  const sample1 = ['Medical equipment',  'Ventilator',   'Philips', 'MX750', 'SN-001', '',  '',        '2024-01-15', 'B-01', '1'];
  const sample2 = ['A/C & Refrigerator', '',             'Samsung', 'AR18',  'AC-002', '',  '1.5 Ton', '2024-01-16', 'B-01', '2'];
  const sample3 = ['Furniture',          'Office Table', '',        '',      '',       '4', '',         '2024-01-17', 'B-01', '3'];

  const ws = XLSX.utils.aoa_to_sheet([headerRow, sample1, sample2, sample3]);

  // Force Date column (index 7) to be text so xlsx won't convert to serial number
  ['B2','B3','B4'].forEach(cell => {
    if (ws[cell]) ws[cell].t = 's';
  });

  ws['!cols'] = COLUMNS.map(c => ({ wch: Math.max(c.label.length, c.example.length) + 4 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Equipment');
  XLSX.writeFile(wb, 'equipment_upload_template.xlsx');
}

// ── Parse Excel → array of objects ────────────────────────────────────────────
function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Read without cellDates — handle all date formats manually
        const wb   = XLSX.read(e.target.result, { type: 'binary', cellDates: false });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        // raw:false → everything as formatted string (safer for dates & numbers)
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });

        // Normalise column keys — handle case/space/underscore variations
        const normalised = rows.map(row => {
          const obj = {};
          Object.entries(row).forEach(([k, v]) => {
            const col = COLUMNS.find(c =>
              c.label.toLowerCase().replace(/[\s_-]+/g, '') ===
              k.toLowerCase().replace(/[\s_-]+/g, '')
            );
            if (col) obj[col.key] = v === null || v === undefined ? '' : String(v).trim();
          });
          return obj;
        });

        // Filter completely empty rows
        const filtered = normalised.filter(r =>
          Object.values(r).some(v => v !== '' && v !== null && v !== undefined)
        );
        resolve(filtered);
      } catch (err) {
        reject(new Error('Failed to parse Excel file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}

// ── Normalise date string to YYYY-MM-DD ────────────────────────────────────────
function normaliseDate(val) {
  if (!val || String(val).trim() === '') return '';
  const s = String(val).trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY or MM/DD/YYYY → try parsing
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Return as-is and let backend reject if invalid
  return s;
}

// ─────────────────────────────────────────────────────────────────────────────
function UploadEquipment() {
  const navigate  = useNavigate();
  const dropRef   = useRef(null);
  const fileInput = useRef(null);

  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState([]);   // parsed rows
  const [parseError, setParseError] = useState('');
  const [dragOver,   setDragOver]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [result,     setResult]     = useState(null); // { inserted, skipped, errors }

  // ── Handle file select / drop ──────────────────────────────────────────────
  const handleFile = async (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setParseError('Please upload an Excel file (.xlsx / .xls) or CSV.');
      return;
    }
    setFile(f);
    setParseError('');
    setResult(null);
    try {
      const rows = await parseExcel(f);
      // Normalise dates — already strings from raw:false parse
      const cleaned = rows.map(r => ({ ...r, date: normaliseDate(r.date) }));
      setPreview(cleaned);
    } catch (err) {
      setParseError(err.message);
      setPreview([]);
    }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // ── Row validation helper ──────────────────────────────────────────────────
  const validateRow = (row) => {
    const issues = [];
    const cat = (row.category || '').trim();
    if (!cat) {
      issues.push('Category missing');
    } else if (!VALID_CATEGORIES.find(c => c.toLowerCase() === cat.toLowerCase())) {
      issues.push(`Unknown category: "${cat}"`);
    }
    if (!row.date || row.date.trim() === '')            issues.push('Date missing');
    if (!row.book || row.book.trim() === '')            issues.push('Book No missing');
    if (row.pageNumber === undefined || row.pageNumber === null || row.pageNumber.trim() === '') {
      issues.push('Page No missing');
    }
    return issues;
  };

  const rowsWithStatus = preview.map(row => ({
    ...row,
    _issues: validateRow(row)
  }));

  const validCount   = rowsWithStatus.filter(r => r._issues.length === 0).length;
  const invalidCount = rowsWithStatus.filter(r => r._issues.length > 0).length;

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (validCount === 0) return;
    setUploading(true);
    setResult(null);
    try {
      const token   = localStorage.getItem('token');
      const records = rowsWithStatus
        .filter(r => r._issues.length === 0)
        .map(({ _issues, ...rest }) => rest);

      const res = await api.post(
        '/api/equipment/bulk-add',
        { records },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult({ type: 'success', ...res.data });
      setPreview([]);
      setFile(null);
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.message || 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null); setPreview([]); setParseError(''); setResult(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20
                    dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 transition-colors duration-200">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600
                            flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                Upload Equipment via Excel
              </h1>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                Upload an Excel sheet — all rows will be saved automatically
              </p>
            </div>
          </div>
        </div>

        {/* ── Result banner ── */}
        {result && (
          <div className={`flex items-start gap-3 mb-6 px-5 py-4 rounded-2xl border text-sm font-medium ${
            result.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
              : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
          }`}>
            <span className="text-xl shrink-0">{result.type === 'success' ? '✅' : '❌'}</span>
            <div className="flex-1">
              <p className="font-bold">{result.type === 'success' ? result.message : result.message}</p>
              {result.type === 'success' && result.skipped > 0 && (
                <p className="mt-1 text-xs opacity-80">{result.skipped} row{result.skipped !== 1 ? 's' : ''} skipped due to errors.</p>
              )}
              {result.errors?.length > 0 && (
                <ul className="mt-2 text-xs space-y-0.5 opacity-80">
                  {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {result.type === 'success' && (
                <button onClick={() => navigate('/institution-dashboard')}
                  className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition">
                  View Records
                </button>
              )}
              <button onClick={reset} className="text-xs opacity-60 hover:opacity-100 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8">

          {/* ── LEFT: Instructions + template ── */}
          <div className="space-y-5">

            {/* Template download */}
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Download Template</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Use this format for your data</p>
                </div>
              </div>
              <button onClick={downloadTemplate}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700
                           text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-md shadow-indigo-100 dark:shadow-indigo-900/30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Sample Template
              </button>
            </div>

            {/* Column guide */}
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                Column Guide
              </p>
              <div className="space-y-2">
                {COLUMNS.map(col => (
                  <div key={col.key} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {col.required
                        ? <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                        : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                      }
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{col.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono shrink-0">{col.example}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="text-[10px] text-slate-500 dark:text-slate-500">Required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-[10px] text-slate-500 dark:text-slate-500">Optional</span>
                </div>
              </div>
            </div>

            {/* Valid categories */}
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                Valid Categories
              </p>
              <div className="space-y-1.5">
                {VALID_CATEGORIES.map(c => (
                  <div key={c} className="flex items-center gap-2">
                    <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Upload area + preview ── */}
          <div className="space-y-5">

            {/* Drop zone */}
            {!file ? (
              <div
                ref={dropRef}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInput.current?.click()}
                className={`border-2 border-dashed rounded-3xl flex flex-col items-center justify-center py-16 cursor-pointer
                            transition-all duration-200 select-none
                            ${dragOver
                              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 scale-[1.01]'
                              : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/30'
                            }`}
              >
                <input
                  ref={fileInput}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={e => handleFile(e.target.files[0])}
                />
                <div className={`text-5xl mb-4 transition-transform duration-200 ${dragOver ? 'scale-125' : ''}`}>
                  {dragOver ? '📂' : '📊'}
                </div>
                <p className="font-bold text-slate-600 dark:text-slate-300 text-sm">
                  {dragOver ? 'Drop your file here' : 'Drag & drop your Excel file'}
                </p>
                <p className="text-slate-400 dark:text-slate-600 text-xs mt-1.5">
                  or click to browse  ·  .xlsx / .xls / .csv
                </p>
              </div>
            ) : (
              /* File loaded */
              <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-xl">
                    📊
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {preview.length} row{preview.length !== 1 ? 's' : ''} found
                      {validCount > 0 && <span className="text-emerald-600 dark:text-emerald-400 ml-2">· {validCount} valid</span>}
                      {invalidCount > 0 && <span className="text-red-500 ml-2">· {invalidCount} with errors</span>}
                    </p>
                  </div>
                  <button onClick={reset}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                               hover:bg-slate-100 dark:hover:bg-slate-700 transition shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Parse error */}
            {parseError && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20
                              text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
                <span>⚠️</span> {parseError}
              </div>
            )}

            {/* Preview table */}
            {preview.length > 0 && (
              <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Preview — {preview.length} rows
                  </p>
                  <div className="flex items-center gap-3">
                    {validCount > 0 && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {validCount} ready to upload
                      </span>
                    )}
                    {invalidCount > 0 && (
                      <span className="text-[10px] font-semibold text-red-500">
                        {invalidCount} will be skipped
                      </span>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800">
                        <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide w-8">#</th>
                        <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Status</th>
                        <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Category</th>
                        <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Name</th>
                        <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Make</th>
                        <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Model</th>
                        <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Date</th>
                        <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Book/Pg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowsWithStatus.map((row, idx) => (
                        <tr key={idx}
                          className={`border-b border-slate-50 dark:border-slate-700/30 transition-colors
                            ${row._issues.length > 0
                              ? 'bg-red-50/50 dark:bg-red-500/5 hover:bg-red-50 dark:hover:bg-red-500/10'
                              : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/30'
                            }`}>
                          <td className="px-3 py-2.5 text-slate-300 dark:text-slate-600 w-8">{idx + 1}</td>
                          <td className="px-3 py-2.5">
                            {row._issues.length === 0 ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                OK
                              </span>
                            ) : (
                              <span title={row._issues.join(', ')}
                                className="inline-flex items-center gap-1 text-red-500 font-semibold cursor-help">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                Error
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.category || <span className="text-red-400">—</span>}</td>
                          <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300 max-w-[120px] truncate">{row.name || '—'}</td>
                          <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{row.make || '—'}</td>
                          <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{row.model || '—'}</td>
                          <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.date || <span className="text-red-400">—</span>}</td>
                          <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {row.book ? `${row.book} / ${row.pageNumber}` : <span className="text-red-400">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Upload button */}
                <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/40">
                  {validCount === 0 ? (
                    <p className="text-xs text-center text-red-500 font-medium">
                      No valid rows to upload. Please fix the errors in your Excel file.
                    </p>
                  ) : (
                    <div className="flex items-center gap-3">
                      {invalidCount > 0 && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 flex-1">
                          {invalidCount} row{invalidCount !== 1 ? 's' : ''} with errors will be skipped
                        </p>
                      )}
                      <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600
                                   hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50
                                   text-white font-bold py-2.5 px-6 rounded-xl transition-all
                                   shadow-lg shadow-emerald-100 dark:shadow-emerald-900/30
                                   active:scale-[0.98] text-sm ml-auto"
                      >
                        {uploading ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            Uploading…
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            Upload {validCount} Record{validCount !== 1 ? 's' : ''}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadEquipment;
