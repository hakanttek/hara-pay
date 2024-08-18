const express = require('express');
/**
 * @swagger
 * tags:
 *   name: Token
 *   description: API for managing tokens
 */
const router = express.Router();
const TokenController = require('../controllers/token');
const TokenService = require('hara-pay.application/services/token-service');
const { container } = require('../container');

/**
 * @swagger
 * /token/create:
 *   post:
 *     summary: Creates a new token
 *     tags: [Token]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the token
 *                 example: MyToken
 *               symbol:
 *                 type: string
 *                 description: The symbol for the token
 *                 example: MTK
 *               decimals:
 *                 type: integer
 *                 description: The number of decimal places for the token
 *                 example: 2
 *               initialSupply:
 *                 type: integer
 *                 description: The initial supply of the token
 *                 example: 1000000
  *               treasuryAccountId:
 *                 type: string
 *                 description: Treasury Account Id of token
 *     responses:
 *       200:
 *         description: Successfully created token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokenId:
 *                   type: string
 *                   description: ID of the created token
 *                   example: 0.0.123456
 *       500:
 *         description: Server error
 */
// @test: comment this function for testing purpose
router.post('/create', container.get(TokenController).createToken);

/**
 * @swagger
 * /token/transfer:
 *   post:
 *     summary: Transfers tokens from one account to another
 *     tags: [Token]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenId:
 *                 type: string
 *                 description: ID of the token to transfer
 *                 example: 0.0.123456
 *               fromAccountId:
 *                 type: string
 *                 description: Account ID to transfer tokens from
 *                 example: 0.0.123
 *               toAccountId:
 *                 type: string
 *                 description: Account ID to transfer tokens to
 *                 example: 0.0.456
 *               amount:
 *                 type: integer
 *                 description: Amount of tokens to transfer
 *                 example: 1000
 *     responses:
 *       200:
 *         description: Successfully transferred tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status of the transfer
 *                   example: SUCCESS
 *       500:
 *         description: Server error
 */
// @test: comment this function for testing purpose
router.post('/transfer', container.get(TokenController).transferToken);

module.exports = router;