
const router = require("express").Router();
const mobileVideoController = require('../../controllers/mobileVideo.controller')

router.get('/get-url', mobileVideoController.getUrl);

module.exports = router;