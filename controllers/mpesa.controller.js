const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const Transaction = require('../models/transaction.model');


// Sample API route
const home = async (req, res) => {
  res.json({ message: 'This is a sample API route.' });
  console.log('This is a sample API route.');
};

async function getAccessToken() {
  const consumer_key = process.env.MPESA_CONSUMER_KEY;
  const consumer_secret = process.env.MPESA_CONSUMER_SECRET;
  const url =
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const auth =
    'Basic ' +
    new Buffer.from(consumer_key + ':' + consumer_secret).toString('base64');

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: auth,
      },
    });
    const accessToken = response.data.access_token;
    return accessToken;
  } catch (error) {
    throw error;
  }
}

const tokenAccess = async (req, res) => {
  getAccessToken()
    .then((accessToken) => {
      res.json({ message: '😀 Your access token is ' + accessToken });
    })
    .catch(console.log);
};

const stkPush = async (req, res) => {
  const phone = req.body.phone.substring(1);
  const amount = req.body.amount;

  getAccessToken()
    .then((accessToken) => {
      const url =
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
      const auth = 'Bearer ' + accessToken;
      const timestamp = moment().format('YYYYMMDDHHmmss');
      const password = new Buffer.from(
        process.env.MPESA_PAYBILL + process.env.MPESA_PASSKEY + timestamp
      ).toString('base64');

      axios
        .post(
          url,
          {
            BusinessShortCode: process.env.MPESA_PAYBILL,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: `254${phone}`,
            PartyB: '174379',
            PhoneNumber: `254${phone}`,
            CallBackURL:
              'https://1e62-197-237-191-147.ngrok-free.app/api/callback',
            AccountReference: 'My Online Shop',
            TransactionDesc: 'Mpesa Daraja API stk push test',
          },
          {
            headers: {
              Authorization: auth,
            },
          }
        )
        .then((response) => {
          console.log(response.data);
          res.status(200).json({
            msg: 'Request is successful done ✔✔. Please enter mpesa pin to complete the transaction',
            status: true,
          });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({
            msg: 'Request failed',
            status: false,
          });
        });
    })
    .catch(console.log);
};

const callBack = async (req, res) => {
  console.log('STK PUSH CALLBACK');
  const merchantRequestID = req.body.Body.stkCallback.MerchantRequestID;
  const checkoutRequestID = req.body.Body.stkCallback.CheckoutRequestID;
  const resultCode = req.body.Body.stkCallback.ResultCode;
  const resultDesc = req.body.Body.stkCallback.ResultDesc;
  const callbackMetadata = req.body.Body.stkCallback.CallbackMetadata;
  const amount = callbackMetadata.Item[0].Value;
  const mpesaReceiptNumber = callbackMetadata.Item[1].Value;
  const transactionDate = callbackMetadata.Item[3].Value;
  const phoneNumber = callbackMetadata.Item[4].Value;

  console.log('MerchantRequestID:', merchantRequestID);
  console.log('CheckoutRequestID:', checkoutRequestID);
  console.log('ResultCode:', resultCode);
  console.log('ResultDesc:', resultDesc);

  console.log('Amount:', amount);
  console.log('MpesaReceiptNumber:', mpesaReceiptNumber);
  console.log('TransactionDate:', transactionDate);
  console.log('PhoneNumber:', phoneNumber);

  var json = JSON.stringify(req.body);
  fs.writeFile('stkcallback.json', json, 'utf8', function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('STK PUSH CALLBACK STORED SUCCESSFULLY');
  });

  //saving on mongodb database
  const transaction = new Transaction();
  transaction.merchant_request_id = merchantRequestID;
  transaction.checkout_request_id = checkoutRequestID;
  transaction.customer_number = phoneNumber;
  transaction.mpesa_receipt_number = mpesaReceiptNumber;
  transaction.amount = amount;
  transaction.transaction_date = transactionDate;

  await transaction
    .save()
    .then((data) => {
      console.log({ message: 'TRANSACTION SUCCESSFULLY SAVED', data });
    })
    .catch((err) => console.log(err.message));

  res.status(200).json('ok');
};

const getTransactions = async (req, res) => {
  const transactions = await Transaction.find({}).sort({ createdAt: -1 });
  res.status(200).json(transactions);
};

module.exports = { home, tokenAccess, stkPush, getTransactions, callBack };
