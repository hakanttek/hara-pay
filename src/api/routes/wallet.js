const express = require('express');
/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: API for managing wallets and fund transfers
 */
const router = express.Router();
const WalletController = require('../controllers/wallet');
const WalletService = require('hara-pay.application/services/wallet-service');

// Instantiate WalletService and WalletController
const accountId = process.env.ACCOUNT_ID;
const privateKey = process.env.PRIVATE_KEY;
const walletService = new WalletService(accountId, privateKey);
const walletController = new WalletController(walletService);

/**
 * @swagger
 * /wallet/create:
 *   post:
 *     summary: Creates a new wallet
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               initialBalance:
 *                 type: integer
 *                 description: The initial balance for the new wallet
 *                 example: 1000
 *     responses:
 *       200:
 *         description: Successfully created wallet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accountId:
 *                   type: string
 *                   description: ID of the created wallet
 *                   example: 0.0.123456
 *                 privateKey:
 *                   type: string
 *                   description: Private key of the created wallet
 *                   example: <private-key>
 *       500:
 *         description: Server error
 */
router.post('/create', walletController.createWallet);

/**
 * @swagger
 * /wallet/transfer:
 *   post:
 *     summary: Transfers funds from one wallet to another
 *     tags: [Wallet]
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
 *                 example: 0.0.123
 *               senderKey:
 *                 type: string
 *                 description: Private key of the sender
 *                 example: <sender-private-key>
 *               receiverId:
 *                 type: string
 *                 description: Account ID of the receiver
 *                 example: 0.0.456
 *               amount:
 *                 type: integer
 *                 description: Amount of Hbars to transfer
 *                 example: 100
 *     responses:
 *       200:
 *         description: Successfully transferred funds
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status of the transfer
 *                   example: SUCCESS
 *                 transactionId:
 *                   type: string
 *                   description: ID of the transfer transaction
 *                   example: 0.0.7890123
 *       500:
 *         description: Server error
 */
router.post('/transfer', walletController.transferFunds);

module.exports = router;