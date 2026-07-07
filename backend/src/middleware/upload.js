const multer = require('multer');

// Store files in memory (no disk storage needed)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isCSV =
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.mimetype === 'application/csv' ||
    file.originalname.toLowerCase().endsWith('.csv');

  if (isCSV) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed. Please upload a .csv file.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

module.exports = upload;
