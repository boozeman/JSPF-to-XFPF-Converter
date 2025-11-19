const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PY = process.env.PYTHON || 'python3';
const SCRIPT = path.resolve(__dirname, 'convert_jspf_to_xspf.py');

// Static Directory for user interface
app.use(express.static(path.join(__dirname, 'public')));

// Used with file upload
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads') });

// POST endpoint for file re-creation
app.post('/convert', upload.single('jspfFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const inputPath = req.file.path;
  const outputName = 'playlist.xspf';
  const outputPath = path.join(__dirname, outputName);

  // Run Python skripti
  const py = spawn(PY, [SCRIPT, inputPath, outputPath]);

  let stderr = '';
  py.stderr.on('data', (d) => { stderr += d.toString(); });

  py.on('close', (code) => {
    fs.unlink(inputPath, () => {}); // Remove uploaded file

    if (code !== 0) {
      console.error('Python exited with code', code, stderr);
      return res.status(500).send('Conversion failed: ' + stderr);
    }

    // Send created XSPF-file
    res.download(outputPath, outputName, (err) => {
      if (err) console.error('Error sending file:', err);
      // Remove after transfer
      fs.unlink(outputPath, () => {});
    });
  });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Playlist converter server listening on port ${PORT}`));
