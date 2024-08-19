const { Client, TokenCreateTransaction, TransferTransaction, TokenType, AccountBalanceQuery, PrivateKey, Hbar } = require("@hashgraph/sdk");

class TokenService {
  constructor(client, operatorPrivateKey) {
    // Create a PrivateKey object from the string
    this.operatorPrivateKey = PrivateKey.fromString(operatorPrivateKey);

    // Set the Client operator
    this.client = client;
  }

  async createToken(name, symbol, decimals, initialSupply, treasuryAccountId) {
    const transaction = new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setDecimals(decimals)
      .setInitialSupply(initialSupply)
      .setTreasuryAccountId(treasuryAccountId)
      .setTokenType(TokenType.FungibleCommon)
      .freezeWith(this.client);

    const signTx = await transaction.sign(this.operatorPrivateKey);
    const submitTx = await signTx.execute(this.client);
    const receipt = await submitTx.getReceipt(this.client);
    return receipt.tokenId;
  }

  async transferToken(tokenId, fromAccountId, toAccountId, amount) {
    const transaction = new TransferTransaction()
      .addTokenTransfer(tokenId, fromAccountId, -amount)
      .addTokenTransfer(tokenId, toAccountId, amount)
      .freezeWith(this.client);

    const signTx = await transaction.sign(this.operatorPrivateKey);
    const submitTx = await signTx.execute(this.client);
    const receipt = await submitTx.getReceipt(this.client);
    return receipt.status;
  }

  async transferHbar(fromAccountId, toAccountId, amount) {
    const receipt = await new TransferTransaction()
      .addHbarTransfer(fromAccountId, Hbar.from(-amount)) //Sending account
      .addHbarTransfer(toAccountId, Hbar.from(amount)) //Receiving account
      .execute(this.client);

    return receipt;
  }

  async getHbarBalance(accountId) {
    const query = new AccountBalanceQuery()
      .setAccountId(accountId);

    const accountBalance = await query.execute(this.client);
    console.log("The hbar account balance for this account is " + accountBalance.hbars);

    return accountBalance.hbars;
  }
}

module.exports = TokenService;
