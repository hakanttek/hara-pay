// Import necessary modules from the Hedera Hashgraph SDK
const { Client, PrivateKey, AccountId, Hbar, TransferTransaction, AccountCreateTransaction, AccountBalanceQuery } = require('@hashgraph/sdk');

class WalletService {

    constructor(client) {
        this.client = client
    }

    // Function to create a new wallet (account) with initial balance
    async createWallet(initialBalance = 1000) {
        const key = PrivateKey.generate(); // Generate a new private key for the new account
        const tx = await new AccountCreateTransaction()
            .setKey(key.publicKey) // Set the public key for the new account
            .setInitialBalance(new Hbar(initialBalance)) // Set initial balance
            .execute(this.client);

        const receipt = await tx.getReceipt(this.client);
        const newAccountId = receipt.accountId;
        return { accountId: newAccountId, privateKey: key };
    }

    // Function to transfer Hbars between accounts
    async transferFunds(senderId, senderKey, receiverId, amount) {
        const tx = new TransferTransaction()
            .addHbarTransfer(AccountId.fromString(senderId), new Hbar(-amount)) // Deduct amount from sender
            .addHbarTransfer(AccountId.fromString(receiverId), new Hbar(amount)); // Add amount to receiver

        const signedTx = await tx.freezeWith(this.client).sign(PrivateKey.fromString(senderKey));
        const response = await signedTx.execute(this.client);
        const receipt = await response.getReceipt(this.client);

        return { status: receipt.status.toString(), transactionId: response.transactionId.toString() };
    }

    // Function to get the balance of an existing account
    async getAccountBalance(accountId) {
        const balanceQuery = new AccountBalanceQuery()
            .setAccountId(AccountId.fromString(accountId));

        const balance = await balanceQuery.execute(this.client);
        return balance; // Return the balance as a string
    }
}

// Export functions for external use
module.exports = WalletService