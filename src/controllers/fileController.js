const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const FileShare = require("../models/fileShare");
const { UPLOADS_DIR } = require("../middlewares/uploadMiddleware");

const uploadFiles = async (req, res) => {
  try {

    // changes
    console.log("=== UPLOAD HIT ===");
    console.log("Origin:", req.headers.origin);
    console.log(
      "Files received:",
      req.files?.map((f) => f.originalname),
    );

    // changes

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const inviteCode = Math.floor(1000 + Math.random() * 9000).toString();

    const filesData = req.files.map((file) => ({
      originalName: file.originalname,
      savedName: file.filename,
      size: file.size,
    }));

    await FileShare.create({ inviteCode, files: filesData });

    // changes
    console.log("Upload success — inviteCode:", inviteCode);

    res.json({ inviteCode });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

const downloadFiles = async (req, res) => {
  try {
    const { code } = req.params;
    const { fileShare } = req;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="files_${code}.zip"`,
    );

    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      res.destroy();
    });

    archive.pipe(res);

    for (const file of fileShare.files) {
      const filePath = path.join(UPLOADS_DIR, file.savedName);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: file.originalName });
      }
    }

    await archive.finalize();

    // Cleanup after zip is sent
    for (const file of fileShare.files) {
      const filePath = path.join(UPLOADS_DIR, file.savedName);

      fs.unlink(filePath, (err) => {
        if (err) console.error(`Cleanup failed for ${file.savedName}:`, err);
      });
    }

    await FileShare.deleteOne({ inviteCode: code });

  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).json({ error: "Download failed" });
  }
};

const getFileList = async (req, res) => {
  try {
    const { fileShare } = req;
    res.json({
      files: fileShare.files.map((f) => ({
        originalName: f.originalName,
        savedName: f.savedName,
        size: f.size,
      })),
    });

  } catch (error) {
    console.error("File List Error:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

const serveSingleFile = async (req, res) => {
  try {
    const { fileShare } = req;
    const { savedName } = req.params;

    const file = fileShare.files.find((f) => f.savedName === savedName);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = path.join(UPLOADS_DIR, file.savedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    const disposition = req.query.download === "true" ? "attachment" : "inline";
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${file.originalName}"`,
    );

    res.sendFile(filePath);
    
  } catch (error) {
    console.error("Serve File Error:", error);
    res.status(500).json({ error: "Failed to serve file" });
  }
};

module.exports = { uploadFiles, downloadFiles, getFileList, serveSingleFile };
