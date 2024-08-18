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
const { container } = require('../container');

/**
 * @swagger
 * /hbar-faucet/transfer:
 *   post:
 *     summary: Transfer HBAR from the operator to a specified account
 *     tags: [HBAR Faucet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               toAccountId:
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
 *                   example: Insufficient balance or other error message
 */
router.post('/transfer', container.get(HbarFaucetController).transferHbar);

module.exports = router;