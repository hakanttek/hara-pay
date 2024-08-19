const {
  ussdRouter,
  getSenderId,
  checkIfSenderExists,
  createNewUser,
  checkIfUserisVerified,
  createcypher,
  validEmail,
  verifyNewUser,
  firestore,
  addUserKycToDB,
  getRecipientId,
  checkIfRecipientExists,
  getSenderDetails,
  getSenderPrivateKey,
  getReceiverDetails,
  sendcUSD,
  getTxidUrl,
  sendMessage,
  phoneUtil,
  PNF,
  addUserDataToDB,
  admin,
  iv,
  TokenService,
  Client,
  PrivateKey
} = require('hara-pay.application/services/ussd-service')
const ussdCallback = async (req, res) => {
  res.set('Content-Type: text/plain');

  if (!req.body.phoneNumber) res.send("END service is failed")

  const { body: { phoneNumber, sessionId, serviceCode, } } = req;

  const { body: { text: rawText } } = req;
  const text = ussdRouter(rawText);
  const footer = '\n0: Home 00: Back';
  let msg = '';

  let senderMSISDN = phoneNumber.substring(1);
  let senderId = await getSenderId(senderMSISDN);
  // console.log('senderId: ', senderId);   
  var data = text.split('*');
  let userExists = await checkIfSenderExists(senderId);
  // console.log("Sender Exists? ",userExists);

  if (userExists === false) {
    let userCreated = await createNewUser(senderId, senderMSISDN);
    const client = Client.forTestnet()
    await client.setOperator(process.env.ACCOUNT_ID, process.env.PRIVATE_KEY);
    let userData = await addUserDataToDB(senderId, senderMSISDN, client);

    console.log('Created user with userID: ', userCreated);
    console.log('Created user with userData: ', userData);
    // msg += `END Creating your account on HaraPay`;    
  }

  let isverified = await checkIfUserisVerified(senderId);
  if (isverified === false) {
    //  && data[0] !== '7' && data[1] !== '4'
    // console.log("User: ", senderId, "is NOT VERIFIED!");
    // msg += `END Verify your account by dialing *483*354*7*4#`;

    if (data[0] == null || data[0] == '') { //data[0] !== null && data[0] !== '' && data[1] == null

      msg = `CON Welcome to HaraPay. \nKindly Enter your details to verify your account.\n\nEnter new PIN`;
      res.send(msg);
    } else if (data[0] !== '' && data[1] == null) { //data[0] !== null && data[0] !== '' && data[1] == null
      newUserPin = data[0];

      msg = `CON Reenter PIN to confirm`;
      res.send(msg);
    } else if (data[0] !== '' && data[1] !== '' && data[2] == null) {
      confirmUserPin = data[1];

      msg = `CON Enter ID Document Type:\n1. National ID \n2. Passport \n3. AlienID`;
      res.send(msg);
    } else if (data[0] !== '' && data[1] !== '' && data[2] !== '' && data[3] == null) {
      if (data[2] === '1') { documentType = 'ID' }
      else if (data[2] === '2') { documentType = 'Passport' }
      else if (data[2] === '3') { documentType = 'AlienID' }
      else { documentType = 'ID' }

      msg = `CON Enter ${documentType} Number`;
      res.send(msg);
    } else if (data[0] !== '' && data[1] !== '' && data[2] !== '' && data[3] !== '' && data[4] == null) { //data[0] !== null && data[0] !== '' && data[1] == null
      documentNumber = data[3];

      msg = `CON Enter First Name`;
      res.send(msg);
    } else if (data[0] !== '' && data[1] !== '' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] == null) { //data[0] !== null && data[0] !== '' && data[1] == null
      firstname = data[4];
      // console.log('Firstname: ', firstname);

      msg = `CON Enter Last Name`;
      res.send(msg);
    } else if (data[0] !== '' && data[1] !== '' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == null) { //data[0] !== null && data[0] !== '' && data[1] == null
      lastname = data[5];
      // console.log('Lastname: ', lastname);

      msg = `CON Enter Date of Birth.\nFormat: YYYY-MM-DD`;
      res.send(msg);
    } else if (data[0] !== '' && data[1] !== '' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] !== '' && data[7] == null) { //data[0] !== null && data[0] !== '' && data[1] == null
      dateofbirth = data[6];

      msg = `CON Enter Email Address`;
      res.send(msg);
    } else if (data[0] !== '' && data[1] !== '' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] !== '' && data[7] !== '') { //data[0] !== null && data[0] !== '' && data[1] == null
      email = data[7];
      let userMSISDN = phoneNumber.substring(1);
      let userId = await getSenderId(userMSISDN);
      let enc_loginpin = await createcypher(newUserPin, userMSISDN, iv);
      let isvalidEmail = await validEmail(email);
      console.log(isvalidEmail);
      console.log(`User Details=>${userId} : ${newUserPin} : ${confirmUserPin} : ${documentType} : ${documentNumber} : ${firstname} : ${lastname} : ${dateofbirth} : ${email} : ${enc_loginpin}`);

      if (newUserPin === confirmUserPin && newUserPin.length >= 4) {
        msg = `END Thank You. \nYour Account Details will be verified shortly`;
        res.send(msg);
        try {
          let kycData = {
            "documentType": documentType,
            "documentNumber": documentNumber,
            "dateofbirth": dateofbirth,
            "fullName": `${firstname} ${lastname}`
          }

          //Update User account and enable
          let updateinfo = await verifyNewUser(userId, email, newUserPin, enc_loginpin, firstname, lastname, documentNumber, dateofbirth, userMSISDN);
          await firestore.collection('hashfiles').doc(userId).set({ 'enc_pin': `${enc_loginpin}` });

          let newkycdata = await addUserKycToDB(userId, kycdata);

        } catch (e) { console.log('KYC Failed: No data received') }
      }
      else if (newUserPin.length < 4) {
        console.log('KYC Failed')
        msg = `END PIN Must be atleast 4 characters,\n RETRY again`;
        res.send(msg);
        return;
      }
      else if (newUserPin !== confirmUserPin) {
        msg = `END Your access PIN does not match,\n RETRY again`; //${newUserPin}: ${confirmUserPin}
        res.send(msg);
        return;
      }
    }
  }

  else if (text === '') {
    msg = 'CON Welcome to Harapay:';
    msg += '\n1: View Account';
    msg += '\n2: Send Money';
    msg += '\n3: Deposit Fund (WIP)';
    msg += '\n4: Withdraw Cash (WIP)';
    res.send(msg);
  }

  //  1. TRANSFER FUNDS #SEND MONEY
  else if (data[0] == '2' && data[1] == null) {
    msg = `CON Enter Recipient`;
    msg += footer;
    res.send(msg);
  } else if (data[0] == '2' && data[1] !== '' && data[2] == null) {  //  TRANSFER && PHONENUMBER
    msg = `CON Enter Amount to Send:`;
    msg += footer;
    res.send(msg);

  } else if (data[0] == '2' && data[1] !== '' && data[2] !== '') {//  TRANSFER && PHONENUMBER && AMOUNT
    senderMSISDN = phoneNumber.substring(1);
    // console.log('sender: ', senderMSISDN);
    try { receiverMSISDN = phoneUtil.format(phoneUtil.parseAndKeepRawInput(`${data[1]}`, 'KE'), PNF.E164) } catch (e) { console.log(e) }

    receiverMSISDN = receiverMSISDN.substring(1);
    amount = data[2];
    let hbarAmount = parseFloat(amount);
    // hbarAmount = hbarAmount * 0.0092165;
    senderId = await getSenderId(senderMSISDN)
    // console.log('senderId: ', senderId);
    recipientId = await getRecipientId(receiverMSISDN)
    // console.log('recipientId: ', recipientId);

    let recipientstatusresult = await checkIfRecipientExists(recipientId);
    // console.log("Recipient Exists? ",recipientstatusresult);

    if (recipientstatusresult == false) {
      let recipientUserId = await createNewUser(recipientId, receiverMSISDN);
      let newClient = Client.forTestnet()
      await newClient.setOperator(process.env.ACCOUNT_ID, process.env.PRIVATE_KEY);
      let recipientData = await addUserDataToDB(recipientId, receiverMSISDN, newClient);

      console.log('New Recipient', recipientUserId);
      console.log('New recipient data', recipientData);
    }

    // Retrieve User Blockchain Data
    let senderInfo = await getSenderDetails(senderId);
    let senderprivkey = await getSenderPrivateKey(senderInfo.data().seedKey, senderMSISDN, iv)

    let receiverInfo = await getReceiverDetails(recipientId);
    while (receiverInfo.data() === undefined || receiverInfo.data() === null || receiverInfo.data() === '') {
      await sleep(1000);
      receiverInfo = await getReceiverDetails(recipientId);
    }

    let senderName = '';
    await admin.auth().getUser(senderId).then(user => { senderName = user.displayName; return; }).catch(e => { console.log(e) })
    console.log('Sender fullName: ', senderName);

    let receiverName = '';
    await admin.auth().getUser(recipientId).then(user => { receiverName = user.displayName; return; }).catch(e => { console.log(e) })
    console.log('Receiver fullName: ', receiverName);
    let _receiver = '';

    console.log(senderInfo.data().publicAddress)
    console.log(receiverInfo.data().publicAddress)


    // Pre-configured client for test network (testnet)
    const client = Client.forTestnet()

    //Set the operator with the account ID and private key
    client.setOperator(senderInfo.data().accountId, senderprivkey.toStringDer());
    const tokenService = await new TokenService(client, senderprivkey.toStringDer())


    let receipt = await tokenService.transferHbar(senderInfo.data().accountId, receiverInfo.data().accountId, hbarAmount);
    if (receipt === 'failed') {
      msg = `END Your transaction has failed due to insufficient balance`;
      res.send(msg);
      return;
    }

    if (receiverName == undefined || receiverName == '') { _receiver = receiverMSISDN; } else { _receiver = receiverName; }

    // let url = await getTxidUrl(receipt.transactionHash);
    // let message2sender = `KES ${amount}  sent to ${_receiver}.\nTransaction URL:  ${url}`;
    // let message2receiver = `You have received KES ${amount} from ${senderName}.\nTransaction Link:  ${url}`;
    // console.log('tx URL', url);
    msg = `END ${receipt.status}`;
    res.send(msg);

    sendMessage("+" + senderMSISDN, message2sender);
    sendMessage("+" + receiverMSISDN, message2receiver);
  }

  //  4. ACCOUNT DETAILS
  else if (data[0] == '1' && data[1] == null) {
    // Business logic for first level msg
    msg = `CON Choose account information you want to view`;
    msg += `\n1. Account Details`;
    msg += `\n2. Account balance`;
    msg += `\n3. Account Backup`;
    msg += `\n4. PIN Reset`
    msg += footer;
    res.send(msg);
  } else if (data[0] == '1' && data[1] == '1') {
    // let userMSISDN = phoneNumber.substring(1);
    // msg = await getAccDetails(userMSISDN);  
    // res.send(msg);      
  } else if (data[0] == '1' && data[1] == '2') {
    let userMSISDN = phoneNumber.substring(1);
    const senderId = await getSenderId(userMSISDN)
    let senderInfo = await getSenderDetails(senderId)
    const senderprivkey = await getSenderPrivateKey(senderInfo.data().seedKey, userMSISDN, iv)
    const client = Client.forTestnet()
    await client.setOperator(process.env.ACCOUNT_ID, process.env.PRIVATE_KEY);
    const tokenService = await new TokenService(client, senderprivkey.toStringDer())
    msg = await tokenService.getHbarBalance(senderInfo.data().accountId);
    console.log(msg)
    res.send(`END ${msg}`);
  } else if (data[0] == '1' && data[1] == '3') {
    // let userMSISDN = phoneNumber.substring(1);
    // msg = await getSeedKey(userMSISDN); 
    // res.send(msg);       
  } else if (data[0] == '1' && data[1] == '4') {
    let userMSISDN = phoneNumber.substring(1);
    let userId = await getSenderId(userMSISDN)
    // await admin.auth().setCustomUserClaims(userId, {verifieduser: false});
    // await firestore.collection('hashfiles').doc(userId).delete()
    // await firestore.collection('kycdb').doc(userId).delete()
    // Send Email to user:

    /*
    try{
      let userEmail = '';
      await admin.auth().getUser(userId).then(user => { userEmail = user.email; return; }).catch(e => {console.log(e)}) 
      console.log('User Email: ', userEmail, 'userId: ',userId); 
      
      let newUserPin = await getPinFromUser();
      let enc_loginpin = await createcypher(newUserPin, userMSISDN, iv);
      await firestore.collection('hashfiles').doc(userId).update({'enc_pin' : `${enc_loginpin}`})  
      const message = `Your HaraPay PIN has been reset to: ${newUserPin}`;
      const gmailSendOptions = {
        "user": functions.config().env.gmail.user,
        "pass": functions.config().env.gmail.pass,
        "to": userEmail,
        "subject": "HaraPay PIN"
      }
      sendGmail(gmailSendOptions, message);
      msg = `END Password reset was successful.\n Kindly check ${userEmail} for Details`; 
      res.send(msg);
    }catch(e){
      console.log(`No Email Address`, e);
      msg = `END Password reset failed: You dont have a valid email d`; 
      res.send(msg);
    }
    */
  }
}

module.exports = { ussdCallback }