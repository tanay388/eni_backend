const mongoose = require('mongoose');
const date = require('date-and-time');
const now = new Date;
// console.log(date.format(now, 'YYYY/MM/DD HH:mm:ss'));

const workSchema = mongoose.Schema({
    EmpID: {
        type: String,
        required: true
    },
    EmpName: {
        type: String,
        required: true
    },
    EmpPhone: {
        type: String,
        required: true
    },
    EmpEmail: {
        type: String,
        required: true
    },
    EmpSalaryPerHr: {
        type: Number,
        required: true,
    },
    Date: {
        type: String,
        required: true
    },
    Entry: {
        type: Date,
        required: true
    },
    Exit: {
        type: Date,
        required: false
    },
    HoursWorkedToday: {
        type: Number,
        required: false,
        default: 0
    },
    EarningToday: {
        type: Number,
        required: false,
        default: 0
    }
});

module.exports = mongoose.model('WorkDB', workSchema);