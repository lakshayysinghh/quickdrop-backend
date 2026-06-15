const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/uploadMiddleware");
const validateCode = require("../middlewares/validateCode");
const {
  uploadFiles,
  downloadFiles,
  getFileList,
  serveSingleFile,
} = require("../controllers/fileController");

router.post("/upload", upload.array("file"), uploadFiles);
router.get("/download/:code", validateCode, downloadFiles);
router.get("/files/:code", validateCode, getFileList);
router.get("/file/:code/:savedName", validateCode, serveSingleFile);

module.exports = router;
