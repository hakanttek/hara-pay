const express = require('express');

const router = express.Router();
const HbarFaucetController = require('../controllers/hbar-faucet');
const HbarFaucetService = require('hara-pay.application/services/hbar-faucet-service');

const accountId = process.env.ACCOUNT_ID;
const privateKey = process.env.PRIVATE_KEY;
const hbarFaucetService = new HbarFaucetService(accountId, privateKey);
const hbarFaucetController = new HbarFaucetController(hbarFaucetService);

router.post('/transfer', hbarFaucetController.transferHbar);

module.exports = router;