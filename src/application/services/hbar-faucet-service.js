const { Client, Hbar, TransferTransaction, TransactionId, AccountId, PrivateKey } = require('@hashgraph/sdk');

class HbarFaucetService {
    constructor(client, faucetAccountId, faucetPrivateKey) {
        this.client = client
        this.faucetAccountId = AccountId.fromString(faucetAccountId);
        this.faucetPrivateKey = PrivateKey.fromString(faucetPrivateKey);
    }

    async transferHbar(toAccountId, amount) {
        const transaction = new TransferTransaction()
            .addHbarTransfer(this.faucetAccountId, new Hbar(-amount))
            .addHbarTransfer(AccountId.fromString(toAccountId), new Hbar(amount))
            .setTransactionId(TransactionId.generate(this.faucetAccountId))
            .freezeWith(this.client);

        const signTx = await transaction.sign(this.faucetPrivateKey);
        const txResponse = await signTx.execute(this.client);
        const receipt = await txResponse.getReceipt(this.client);

        return receipt.status;
    }
}

module.exports = HbarFaucetService;