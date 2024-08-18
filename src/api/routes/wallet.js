const express = require('express');
const WalletController = require('../controllers/wallet');
const { container } = require('../container');
/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: API for managing wallets and fund transfers
 */
const router = express.Router();

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
router.post('/create', container.get(WalletController).createWallet);

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
router.post('/transfer', container.get(WalletController).transferFunds);

/**
 * @swagger
 * /wallet/balance:
 *   post:
 *     summary: Retrieves the balance of a wallet
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountId:
 *                 type: string
 *                 description: Account ID of the wallet to check the balance of
 *                 example: 0.0.123
 *     responses:
 *       200:
 *         description: Successfully retrieved wallet balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: integer
 *                   description: The current balance of the wallet
 *                   example: 1000
 *       500:
 *         description: Server error
 */
router.post('/balance', container.get(WalletController).getAccountBalance);

module.exports = router;