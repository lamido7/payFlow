const mongoose = require('mongoose');

//create wallet schema

const walletSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    balance :{type: Number, default: 100}
})

//create wallet model
const Wallet = mongoose.model('Wallet', walletSchema)

//eport wallet model
module.exports = Wallet