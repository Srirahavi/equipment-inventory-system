import Equipment from '../models/Equipment.js';

const VALID_CATEGORIES = [
  'Medical equipment',
  'Electrical equipment',
  'A/C & Refrigerator',
  'Generator',
  'Furniture',
  'Photocopy',
  'IT',
  'Medical Furniture'
];

// ── Single add ────────────────────────────────────────────────────────────────
export const addEquipment = async (req, res) => {
  try {
    const { category, date, book, pageNumber, name, make, model, serialNumber, count, capacity } = req.body;

    if (!category || !date || !book || !pageNumber) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const newEquipment = new Equipment({
      institution: req.user.id,
      category, date, book, pageNumber,
      name, make, model, serialNumber, count, capacity
    });

    await newEquipment.save();
    res.status(201).json({ message: 'Equipment added successfully', equipment: newEquipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Bulk add from Excel ───────────────────────────────────────────────────────
export const bulkAddEquipment = async (req, res) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'No records provided' });
    }

    const errors   = [];
    const toInsert = [];

    records.forEach((row, idx) => {
      const rowNum = idx + 2;

      const matchedCategory = VALID_CATEGORIES.find(
        c => c.toLowerCase() === String(row.category || '').toLowerCase().trim()
      );

      if (!matchedCategory) {
        errors.push(`Row ${rowNum}: Unknown category "${row.category}"`);
        return;
      }

      const dateStr = String(row.date || '').trim();
      const bookStr = String(row.book || '').trim();
      const pageStr = String(row.pageNumber ?? '').trim();

      if (!dateStr) { errors.push(`Row ${rowNum}: Missing date`);        return; }
      if (!bookStr) { errors.push(`Row ${rowNum}: Missing book number`); return; }
      if (!pageStr) { errors.push(`Row ${rowNum}: Missing page number`); return; }

      const parsedDate = new Date(dateStr);
      if (isNaN(parsedDate.getTime())) {
        errors.push(`Row ${rowNum}: Invalid date "${dateStr}" — use YYYY-MM-DD`);
        return;
      }

      toInsert.push({
        institution:  req.user.id,
        category:     matchedCategory,
        date:         parsedDate,
        book:         bookStr,
        pageNumber:   pageStr,
        name:         row.name         ? String(row.name).trim()         : undefined,
        make:         row.make         ? String(row.make).trim()         : undefined,
        model:        row.model        ? String(row.model).trim()        : undefined,
        serialNumber: row.serialNumber ? String(row.serialNumber).trim() : undefined,
        count:        row.count        ? Number(row.count)               : undefined,
        capacity:     row.capacity     ? String(row.capacity).trim()     : undefined,
      });
    });

    if (toInsert.length === 0) {
      return res.status(400).json({ message: 'No valid records to insert', errors });
    }

    await Equipment.insertMany(toInsert, { ordered: false });

    res.status(201).json({
      message:  `${toInsert.length} record${toInsert.length !== 1 ? 's' : ''} added successfully`,
      inserted: toInsert.length,
      skipped:  errors.length,
      errors:   errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Bulk add error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── Get equipments ────────────────────────────────────────────────────────────
export const getEquipments = async (req, res) => {
  try {
    const query = req.user.role === 'institution'
      ? { institution: req.user.id }
      : {};

    const equipments = await Equipment.find(query)
      .populate('institution', 'name username')
      .sort({ createdAt: -1 });

    res.json(equipments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
