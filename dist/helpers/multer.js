"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.diskStorage = void 0;
var multer = require("multer");
var path = require("path");
var diskStorage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, path.join(__dirname, "/public/assets/images/profil/reseller"));
  },
  // konfigurasi penamaan file yang unik
  filename: function filename(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});
exports.diskStorage = diskStorage;
//# sourceMappingURL=multer.js.map