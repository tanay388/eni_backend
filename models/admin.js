const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        require: true,
    },
    currToken: {
        type: String,
        require: true,
    }
});

adminSchema.pre("save", async function(next){
    const salt = await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
    next();
})
//verify password on login

adminSchema.methods.checkPassword= async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}
module.exports = mongoose.model('AdminDB', adminSchema);