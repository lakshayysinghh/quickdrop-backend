const FileShare = require("../models/fileShare");

const validateCode = async (req, res, next) => {
  try {
    const { code } = req.params;

    //
    console.log("=== VALIDATE CODE HIT ===", code);

    if (!code || !/^\d{4}$/.test(code)) {
      //
      console.log("Invalid code format:", code);
      return res.status(400).json({ error: "Invalid invite code format" });
    }

    const fileShare = await FileShare.findOne({ inviteCode: code });

    if (!fileShare || fileShare.files.length === 0) {

      //
      console.log("Code not found in DB:", code);

      return res
        .status(404)
        .json({ error: "Invalid invite code or files have expired" });
    }

    //
    console.log("Code valid — files:", fileShare.files.length);

    req.fileShare = fileShare;
    next();
  } catch (error) {
    console.error("ValidateCode Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = validateCode;
