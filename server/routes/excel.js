const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.get('/download', (req, res) => {
  const filePath = path.join(__dirname, '..', '..', '90_Day_Body_Recomposition_Tracker.xlsx');
  if (fs.existsSync(filePath)) {
    res.download(filePath, '90_Day_Body_Recomposition_Tracker.xlsx');
  } else {
    res.status(404).json({ success: false, message: 'Excel workbook file not found on server' });
  }
});

module.exports = router;

