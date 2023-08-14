const mongoose = require("mongoose");
const {Schema} = require("mongoose");

const transactionSchema = new Schema({
    merchant_request_id: { type: String, require },
    checkout_request_id: { type: String, require },
    customer_number: { type: String, require },
    mpesa_receipt_number: { type: String, require },
    amount: { type: String, require },
    transaction_date: { type: String, require },
}, {
    timestamps: true
})

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;