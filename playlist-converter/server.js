const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PY = process.env.PYTHON || 'python3';
const SCRIPT = path.resolve(__dirname, 'convert_jspf_to_xspf.py');

// Static UI
app.use(express.static(path.join(__dirname, 'public')));

// Upload temp folder
const upload = multer({ dest: path.join(__dirname, 'uploads') });


// ------------------------------------------
// POST /convert
// ------------------------------------------
app.post('/convert', upload.single('jspfFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const inputPath = req.file.path;
  const originalName = path.parse(req.file.originalname).name;  // filename without .jspf
  const outputName = originalName + ".xspf";
  const outputPath = path.join(__dirname, outputName);

  console.log(`Converting ${req.file.originalname} → ${outputName}`);

  // Run Python converter
  const py = spawn(PY, [SCRIPT, inputPath, outputPath]);

  let stderr = '';
  py.stderr.on('data', (d) => { stderr += d.toString(); });

  py.on('close', (code) => {

    // Delete uploaded JSPF
    fs.unlink(inputPath, () => {});

    if (code !== 0) {
      console.error("Python exited with", code, stderr);
      return res.status(500).send("Conversion failed: " + stderr);
    }

    // Return JSON info so client can download via /download
    res.json({ filename: outputName });
  });
});


// ------------------------------------------
// GET /download/:file
// ------------------------------------------
app.get('/download/:file', (req, res) => {
  const filePath = path.join(__dirname, req.params.file);

  // Download and remove after send
  res.download(filePath, req.params.file, (err) => {
    if (err) {
      console.error("Error sending file:", err);
    }

    // Remove converted file afterwards
    fs.unlink(filePath, () => {});
  });
});


// ------------------------------------------
const PORT = process.env.PORT || 3003;
app.listen(PORT, () =>
  console.log(`Playlist converter server running on port ${PORT}`)
);
