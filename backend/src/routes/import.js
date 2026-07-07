const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { parseCSV } = require('../services/csvParser');
const { extractCRMRecords } = require('../services/aiExtractor');

/**
 * POST /api/import/preview
 * Accepts a CSV file, parses it, and returns raw rows for preview.
 * NO AI processing happens here.
 */
router.post('/preview', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please select a CSV file.' });
    }

    const records = parseCSV(req.file.buffer);

    if (records.length === 0) {
      return res.status(400).json({ error: 'The uploaded CSV file appears to be empty.' });
    }

    const headers = Object.keys(records[0]);

    return res.json({
      success: true,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      totalRows: records.length,
      headers,
      preview: records.slice(0, 500), // Up to 500 rows for preview
    });
  } catch (err) {
    console.error('Preview error:', err.message);
    return res.status(500).json({ error: `Failed to read CSV: ${err.message}` });
  }
});

/**
 * POST /api/import/process
 * Accepts a CSV file, runs AI extraction in batches, and returns CRM records.
 */
router.post('/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please select a CSV file.' });
    }

    const records = parseCSV(req.file.buffer);

    if (records.length === 0) {
      return res.status(400).json({ error: 'The uploaded CSV file appears to be empty.' });
    }

    console.log(`\n📁 File: "${req.file.originalname}" — ${records.length} records to process`);

    const result = await extractCRMRecords(records);

    return res.json({
      success: true,
      fileName: req.file.originalname,
      totalProcessed: records.length,
      totalImported: result.success.length,
      totalSkipped: result.skipped.length,
      records: result.success,
      skipped: result.skipped,
      errors: result.errors,
    });
  } catch (err) {
    console.error('Process error:', err.message);
    return res.status(500).json({ error: `Processing failed: ${err.message}` });
  }
});

module.exports = router;
