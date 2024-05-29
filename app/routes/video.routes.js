
const router = require("express").Router();
const uploadMiddleware = require('../middlewares/upload.middleware')
const videoUploadController = require('../controllers/videoUpload.controller')

router.post('/upload', uploadMiddleware.upload.single('file'), videoUploadController.upload);
router.get('/load', videoUploadController.load);
router.get('/load-url', videoUploadController.loadUrl);

module.exports = router;
