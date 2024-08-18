const { Client, Hbar, TransferTransaction, TransactionId } = require('@hashgraph/sdk');

class HbarFaucetService {
    constructor(faucetAccountId, faucetPrivateKey) {
        this.client = Client.forTestnet();
        this.client.setOperator(faucetAccountId, faucetPrivateKey);
    }

    async transferHbar(toAccountId, amount) {
        const transaction = new TransferTransaction()
            .addHbarTransfer(this.client.operatorAccountId, new Hbar(-amount))
            .addHbarTransfer(toAccountId, new Hbar(amount))
            .setTransactionId(TransactionId.generate(this.client.operatorAccountId))
            .freezeWith(this.client);

        const signTx = await transaction.sign(this.client.operatorPrivateKey);
        const txResponse = await signTx.execute(this.client);
        const receipt = await txResponse.getReceipt(this.client);

        return receipt.status;
    }
}

module.exports = HbarFaucetService;