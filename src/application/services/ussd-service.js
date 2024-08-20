'use strict';

// Firebase init
const admin = require('firebase-admin');
const serviceAccount = require('/etc/secrets/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: functions.config().env.firebase.db_url,
});

const firestore = admin.firestore();
const crypto = require('crypto');
const bip39 = require('bip39-light');

// Express and CORS middleware init
const { ussdRouter } = require('ussd-router');

// Initialize the firebase auth
// const firebaseAuth = createFirebaseAuth({ ignoredUrls: ['/ignore'], serviceAccount, admin });

const getAuthToken = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    req.authToken = req.headers.authorization.split(' ')[1];
    console.log("Auth Token", req.headers.authorization);
  } else {
    // req.authToken = null;
    return res.status(201).json({
      message: 'Not Allowed'
    });
  }
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.token) {
    res.send('401 - Not authenticated!');
    return;
  }
  next();
}

const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
// const jenga = require('./jengakit');

// var randomstring = require("randomstring");
var { getTxidUrl,
  createcypher,
  decryptcypher,
  sendMessage,
} = require('../utilities/ussd');

// ENV VARIABLES
// @TODO: store this in a remote safe cloud to secure cryptographic operations
const iv = `require('firebase-functions').config().env.crypto_iv.key;`
// const enc_decr_fn = functions.config().env.algo.enc_decr;
// const  phone_hash_fn = functions.config().env.algo.msisdn_hash;
const phone_hash_fn = "sha512"

// const escrowMSISDN = functions.config().env.escrow.msisdn;


const { Mnemonic, PrivateKey, Client, AccountCreateTransaction, Hbar } = require("@hashgraph/sdk");

const TokenService = require('./token-service')



// GLOBAL VARIABLES
// let publicAddress = '';
let senderMSISDN = '';
let receiverMSISDN = '';
var recipientId = '';
var senderId = '';
let amount = '';
let withdrawId = '';
let depositId = '';
let escrowId = '';
let newUserPin = '';
let confirmUserPin = '';
let documentType = '';
let documentNumber = '';
let idnumber = '';
let firstname = '';
let lastname = '';
let dateofbirth = '';
let email = '';
let usdMarketRate = 108.5;


async function getSenderPrivateKey(seedCypher, senderMSISDN, iv) {
  try {
    let senderSeed = await decryptcypher(seedCypher, senderMSISDN, iv);
    let recoveredSeed = await Mnemonic.fromString(senderSeed.toString())
    let senderprivkey = await recoveredSeed.toStandardECDSAsecp256k1PrivateKey();

    return new Promise(resolve => {
      resolve(senderprivkey)
    });
  } catch (err) { console.log('Unable to decrypt cypher') }
}


async function addUserDataToDB(userId, userMSISDN, nodeClient) {
  try {
    let mnemonic = await bip39.generateMnemonic(256);
    var enc_seed = await createcypher(mnemonic.toString(), userMSISDN, iv);

    const recoveredMnemonic = await Mnemonic.fromString(mnemonic.toString());
    const privateKey = await recoveredMnemonic.toStandardECDSAsecp256k1PrivateKey();
    const publicAddress = privateKey.publicKey.toEvmAddress();

    console.log('Public Address: ', publicAddress);

    // Create a new account with 1,000 tinybar starting balance
    const newAccountTransactionResponse = await new AccountCreateTransaction()
      .setKey(privateKey.publicKey)
      .setInitialBalance(Hbar.from(1))
      .execute(nodeClient);

    // Get the new account ID
    const getReceipt = await newAccountTransactionResponse.getReceipt(nodeClient);
    const newAccountId = getReceipt.accountId;

    console.log("\nNew account ID: " + newAccountId);

    const newAccount = {
      'seedKey': `${enc_seed}`,
      'publicAddress': `${publicAddress}`,
      'accountId': `${newAccountId.toString()}`
    };

    let db = firestore.collection('accounts').doc(userId);
    db.set(newAccount).then(newDoc => { console.log("Document Created: ", newDoc.id) })

  } catch (err) { console.log('accounts db error: ', err) }
}

async function getSenderDetails(senderId) {
  let db = firestore.collection('accounts').doc(senderId);
  let result = await db.get();
  return result;
}


async function getLoginPin(userId) {
  let db = firestore.collection('hashfiles').doc(userId);
  let result = await db.get();
  return result.data().enc_pin;
}

async function getReceiverDetails(recipientId) {
  let db = firestore.collection('accounts').doc(recipientId);
  let result = await db.get();
  return result;
}

function number_format(val, decimals) {
  //Parse the value as a float value
  val = parseFloat(val);
  //Format the value w/ the specified number
  //of decimal places and return it.
  return val.toFixed(decimals);
}

function getSenderId(senderMSISDN) {
  return new Promise(resolve => {
    let senderId = crypto.createHash(phone_hash_fn).update(senderMSISDN).digest('hex');
    resolve(senderId);
  });
}

function getRecipientId(receiverMSISDN) {
  return new Promise(resolve => {
    let recipientId = crypto.createHash(phone_hash_fn).update(receiverMSISDN).digest('hex');
    resolve(recipientId);
  });
}

async function checkIfSenderExists(senderId) {
  return await checkIfUserExists(senderId);
}

async function checkIfRecipientExists(recipientId) {
  return await checkIfUserExists(recipientId);
}

async function checkIfUserisVerified(userId) {
  var isVerified;
  return new Promise(resolve => {
    admin.auth().getUser(userId)
      .then(function (userRecord) {
        if (userRecord.customClaims['verifieduser'] === true) {
          // console.log(userRecord.customClaims['verifieduser']);
          isVerified = true;
          resolve(isVerified);
        } else {
          // console.log("User: ", userId, "is NOT VERIFIED!:\n");
          isVerified = false;
          resolve(isVerified);
        }
      })
      .catch(function (error) {
        // console.log('Error fetching user data:', userId, "does not EXIST:\n");
        isVerified = false;
        resolve(isVerified);
      });
  });
}

// Validates email address of course.
function validEmail(e) {
  var filter = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
  return String(e).search(filter) != -1;
}

async function checkIfUserExists(userId) {
  var exists;
  return new Promise(resolve => {
    admin.auth().getUser(userId)
      .then(function (userRecord) {
        if (userRecord) {
          // console.log('Successfully fetched user data:', userRecord.uid);
          exists = true;
          resolve(exists);
        } else {
          // console.log("Document", userId, "does not exists:\n");
          exists = false;
          resolve(exists);
        }
      })
      .catch(function (error) {
        console.log('Error fetching user data:', userId, "does not exists:\n");
        exists = false;
        resolve(exists);
      });
  });
}

function sleep(ms) {
  return Promise(resolve => setTimeout(resolve, ms));
}

function createNewUser(userId, userMSISDN) {
  return new Promise(resolve => {
    admin.auth().createUser({
      uid: userId,
      phoneNumber: `+${userMSISDN}`,
      disabled: true
    })
      .then(userRecord => {
        admin.auth().setCustomUserClaims(userRecord.uid, { verifieduser: false })
        console.log('Successfully created new user:', userRecord.uid);
        resolve(userRecord.uid);
      })
      .catch(function (error) {
        console.log('Error creating new user:', error);
      });
  });
}

async function verifyNewUser(userId, email, newUserPin, password) {
  return new Promise(resolve => {
    admin.auth().updateUser(userId, {
      password: `${password}`,
      emailVerified: false,
      disabled: false
    })
      .then(userRecord => {
        admin.auth().setCustomUserClaims(userRecord.uid, { verifieduser: true })
        //Inform user that account is now verified
        // let message2sender = `Welcome to Harapay.\nYour account details have been verified.\nDial *384*99899# to access the HaraPay Ecosytem.\nUser PIN: ${newUserPin}`;
        // sendMessage("+"+userMSISDN, message2sender);
        resolve(userRecord.uid);
      })
      .catch(function (error) {
        console.log('Error updating user:', error);
      });
  });
}

module.exports = {
  ussdRouter,
  getSenderId,
  checkIfSenderExists,
  createNewUser,
  checkIfUserisVerified,
  createcypher,
  validEmail,
  verifyNewUser,
  firestore,
  getRecipientId,
  checkIfRecipientExists,
  getSenderDetails,
  getSenderPrivateKey,
  getReceiverDetails,
  getTxidUrl,
  sendMessage,
  phoneUtil,
  PNF,
  addUserDataToDB,
  admin,
  TokenService,
  PrivateKey,
  Client,
  getLoginPin,
  iv
}