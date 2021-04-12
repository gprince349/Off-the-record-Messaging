const router = require("express").Router();
const cont = require("../controllers/controller")

router.get("/home", cont.getHome);
router.post("/createChannel", cont.createChannel);
router.post("/joinChannel", cont.joinChannel);
router.post("/leaveChannel", cont.leaveChannel);

module.exports = router;