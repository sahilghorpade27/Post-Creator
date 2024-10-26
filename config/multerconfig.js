const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

// Disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/uploads');
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(12, (err, name) => {
            if (err) return cb(err); // Handle error
            const fn = name.toString("hex") + path.extname(file.originalname); // Use file's original extension
            cb(null, fn);
        });
    }
});

// Export upload variable
const upload = multer({ storage: storage });
module.exports = upload;
