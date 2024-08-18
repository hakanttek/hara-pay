class HbarFaucetController {
  constructor(hbarFaucetService) {
    this.hbarFaucetService = hbarFaucetService;

    // Bind the methods to ensure `this` context is correct
    this.transferHbar = this.transferHbar.bind(this);
  }

  // Method to create a new wallet
  async transferHbar(req, res) {
    const { toAccountId, amount } = req.body;
    try {
      const status = await this.hbarFaucetService.transferHbar(toAccountId, amount);
      res.json({ status: status.toString() });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = HbarFaucetController;