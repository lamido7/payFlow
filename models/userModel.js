const mongoose = require('mongoose');

//create user schema
//this schema defines the structure of the data that will be stored in the database
const userSchema = new mongoose.Schema({
    userName :{
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet'
    }
});

//create user model
const User = mongoose.model('User', userSchema);

//export user model
module.exports = User;
