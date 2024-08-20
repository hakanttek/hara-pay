# Setup, Configuration, and Testing Instructions

1. **Firebase Service Account:** In Firebase Console, select your project, go to `Service accounts`," click "Generate new private key", and place the JSON file in `etc/secrets/serviceAccountKey.json`.

2. **Environment Variables:** Define `ACCOUNT_ID` and `PRIVATE_KEY` (DER Encoded Private Key) in the `api/.env` file.

3. **Testing Instructions:** 
   - Ensure all necessary configurations and environment variables are set (see steps 1 and 2).
   - Navigate to the `src/api` directory.
   - Run `npm start` to start the server and perform tests.

4. **API Endpoints:** To explore and test the API endpoints, refer to the Swagger documentation available at `/api-docs/`.

## USSD Testing (for users)
1. Go to [AfricasTalking's Simulator](https://developers.africastalking.com/simulator).

2. Enter the phone number. Click "Connect".

3. Open the "phone" icon, then type this number \*384*99899#

4. You will be accessible for HaraPay's service now.

## Current Functionalities
1. **Create Wallet Function** 
2. **Button 3: Transfer Token** 
3. **Button 6: View Balance**

## If Error
If an error occurs during the first input of the number (\*384*99899#), wait 1 minute, redial, and call the number. The error should be resolved.


# What is HaraPay? 

HaraPay is your bridge between traditional financial services and blockchain technology, tailored specifically for Africa. Conducting crypto transactions in regions with limited internet access can be challenging, and HaraPay addresses this by enabling seamless and secure transactions via USSD, eliminating the dependency on internet connectivity.

## Setup and Configuration

- **API Endpoints:** To explore and test the API endpoints, refer to the Swagger documentation available at `/api-docs/`.

- **Firebase Service Account:** Generate the required `serviceAccountKey.json` and place it in the `src/application/serviceAccountKey.json` file.

- **Environment Variables:** Define `ACCOUNT_ID` and `PRIVATE_KEY` (DER Encoded Private Key) in the `api/.env` file.

## Why HaraPay?

HaraPay steps in as a solution to bridge the gap between blockchain and traditional financial systems. It empowers users to interact with cryptocurrencies and fiat seamlessly, even in areas with limited internet access. HaraPay integrates with existing financial tools, allowing users to conduct financial transactions, including buying crypto, transferring funds, and making deposits, all from a basic mobile phone.

## What Makes HaraPay Unique?

HaraPay is a game-changer, seamlessly integrating with existing protocols and tools to offer a straightforward and user-friendly interface for cryptocurrency and fiat transactions. Instead of navigating multiple platforms to perform a single transaction, HaraPay provides an all-in-one solution. With HaraPay, managing your finances becomes as simple as dialing a short code on your mobile device.

## Your Personal Account
Your phone number is more than just a way to stay connected—it's a unique personal identifier that stays with you no matter what. At HaraPay, we leverage this reliability by seamlessly integrating your phone number with your Hedera wallet ID, no need to remember complex addresses anymore, just use your existing number to send and receive funds instantly.

### Key Features:

- **USSD-based Wallet Creation and Management** 
- **Token Transactions (Transfer, Buy, Sell)** 
- **Crypto-to-Bank Conversion** 
- **Secure PIN-based Authentication** 
- **SMS Confirmation for Transactions**
-  **NFT Trading** 

### Future Innovations
Crypto Debit Cards: Enable users to spend crypto directly from their HaraPay wallets.
Virtual Debit Cards: Provide a virtual card for online transactions.

## Impact and Scalability
HaraPay aims to revolutionize financial services in Africa and Beyond, providing financial inclusion for millions of unbanked individuals and empowering local businesses, thereby contributing to economic growth.

## Technical Execution

- **Backend:** Node.js and Firebase.
- **Blockchain Integration:** Hedera SDK.
- **USSD and SMS Services:** Africa’s Talking.
- **Frontend:** React Native for POS systems.

## Team

- **Blossom:** Frontend developer
- **Fredrick:** Project Management and UI/UX Development
- **Kyler:** Smart Contract Development and Security
- **Darren:** Finance, Economics, Basic Coding, QA
- **Hakan:** Backend developer 

## Roadmap

- **Phase 1:** MVP Development and Testing
- **Phase 2:** Launch in Pilot Markets
- **Phase 3:** Expand to Other African Countries
- **Phase 4:** Global Expansion

---
### Contact:
For more information, please contact us at info.harapay@gmail.com

