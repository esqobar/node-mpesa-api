const express = require('express')
const {home, tokenAccess, stkPush, callBack, getTransactions} = require("../controllers/mpesa.controller");

const router = express.Router()

router.route('/home').get(home)
router.route("/access_token").get(tokenAccess)
router.route("/transactions").get(getTransactions)
router.route("/stkpush").post(stkPush)
router.route("/callback").post(callBack)

module.exports = router