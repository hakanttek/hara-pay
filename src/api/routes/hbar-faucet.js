const express = require('express');

/**
 * @swagger
 * tags:
 *   name: HBAR Faucet
 *   description: API for transferring HBAR between accounts
 */
const router = express.Router();
const HbarFaucetController = require('../controllers/hbar-faucet');
const HbarFaucetService = require('hara-pay.application/services/hbar-faucet-service');

const accountId = process.env.ACCOUNT_ID;
const privateKey = process.env.PRIVATE_KEY;
const hbarFaucetService = new HbarFaucetService(accountId, privateKey);
const hbarFaucetController = new HbarFaucetController(hbarFaucetService);

/**
 * @swagger
 * /transfer:
 *   post:
 *     summary: Transfer HBAR from one account to another
 *     tags: [HBAR Faucet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senderId:
 *                 type: string
 *                 description: Account ID of the sender
 *                 example: 0.0.1234
 *               senderKey:
 *                 type: string
 *                 description: Private key of the sender's account
 *                 example: 302e020100300506032b657004220420...
 *               receiverId:
 *                 type: string
 *                 description: Account ID of the receiver
 *                 example: 0.0.5678
 *               amount:
 *                 type: number
 *                 description: Amount of HBAR to transfer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Successfully transferred HBAR
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status of the transaction
 *                   example: SUCCESS
 *                 transactionId:
 *                   type: string
 *                   description: ID of the transaction
 *                   example: 0.0.1234@1620123456.7890
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Insufficient balance
 */
router.post('/transfer', hbarFaucetController.transferHbar);

module.exports = router;