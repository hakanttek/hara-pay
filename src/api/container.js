const { Container, injectable, inject } = require('inversify');
const { Client, Client: NodeClient } = require('@hashgraph/sdk');
const WalletService = require('hara-pay.application/services/wallet-service');
const WalletController = require('./controllers/wallet');
const TokenService = require('hara-pay.application/services/token-service');
const TokenController = require('./controllers/token');
const HbarFaucetService = require('hara-pay.application/services/hbar-faucet-service');
const HbarFaucetController = require('./controllers/hbar-faucet');


const container = new Container();

container.bind(NodeClient).toDynamicValue(() => {
  this.client = Client.forTestnet();
  const accountId = process.env.ACCOUNT_ID;
  const privateKey = process.env.PRIVATE_KEY;
  this.client.setOperator(accountId, privateKey);
  return this.client;
}).inSingletonScope();

//wallet
container
  .bind(WalletService)
  .toDynamicValue(() => new WalletService(container.get(NodeClient)))
  .inSingletonScope();

container
  .bind(WalletController)
  .toDynamicValue(() => new WalletController(container.get(WalletService)))
  .inSingletonScope();

//token
container
  .bind(TokenService)
  .toDynamicValue(() => new TokenService(container.get(NodeClient), process.env.PRIVATE_KEY))
  .inSingletonScope();

container
  .bind(TokenController)
  .toDynamicValue(() => new TokenController(container.get(TokenService)))
  .inSingletonScope();

//hbar-faucet
container
  .bind(HbarFaucetService)
  .toDynamicValue(() => new HbarFaucetService(container.get(NodeClient), process.env.ACCOUNT_ID, process.env.PRIVATE_KEY))
  .inSingletonScope();

container
  .bind(HbarFaucetController)
  .toDynamicValue(() => new HbarFaucetController(container.get(HbarFaucetService)))
  .inSingletonScope();

module.exports = { container }