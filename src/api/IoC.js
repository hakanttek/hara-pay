const WalletService = require('hara-pay.application/services/wallet-service');

// Instantiate WalletService and WalletController
const accountId = process.env.ACCOUNT_ID;
const privateKey = process.env.PRIVATE_KEY;
const walletService = new WalletService(accountId, privateKey);

module.exports = walletService;