const express = require('express');

class WalletController {
  constructor(walletService) {
    this.walletService = walletService;

    // Bind the methods to ensure `this` context is correct
    this.createWallet = this.createWallet.bind(this);
    this.transferFunds = this.transferFunds.bind(this);
    this.getAccountBalance = this.getAccountBalance.bind(this);
  }

  // Method to create a new wallet
  async createWallet(req, res) {
    const { initialBalance } = req.body;
    try {
      const { accountId, privateKey } = await this.walletService.createWallet(initialBalance);
      res.json({ accountId: accountId.toString(), privateKey: privateKey.toString() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Method to transfer funds between wallets
  async transferFunds(req, res) {
    const { senderId, senderKey, receiverId, amount } = req.body;
    try {
      const status = await this.walletService.transferFunds(senderId, senderKey, receiverId, amount);
      res.json({ status: status.status, transactionId: status.transactionId });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message });
    }
  }

  async getAccountBalance(req, res) {
    const { accountId } = req.body;
    try {
      var balance = await this.walletService.getAccountBalance(accountId)
      res.json({ foo: balance.hbars.toString() });
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: err.message })
    }
  }
}

module.exports = WalletController;