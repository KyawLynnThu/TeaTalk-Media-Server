const router = require("express").Router();

router.use("/videos", require('./video.routes'));
router.use("/videos/mobile", require('./mobile/mobileVideo.routes'));

module.exports = router;
