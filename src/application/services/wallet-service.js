// Import necessary modules from the Hedera Hashgraph SDK
const { Client, PrivateKey, AccountId, Hbar, TransferTransaction, AccountCreateTransaction } = require('@hashgraph/sdk');

class WalletService {

    constructor(operatorId, operatorKey) {
        // Initialize client
        this.client = Client.forTestnet(); // Use Client.forMainnet() for production
        this.client.setOperator(operatorId, operatorKey);
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
        const tx = await new TransferTransaction()
            .addHbarTransfer(senderId, new Hbar(-amount)) // Deduct amount from sender
            .addHbarTransfer(receiverId, new Hbar(amount)) // Add amount to receiver
            .freezeWith(this.client)
            .sign(senderKey) // Sign the transaction with the sender's private key
            .execute(this.client);

        const receipt = await tx.getReceipt(this.client);
        return { status: receipt.status.toString(), transactionId: tx.transactionId.toString() };
    }
}

// Export functions for external use
module.exports = WalletService