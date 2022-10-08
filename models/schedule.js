const mongoose = require('mongoose');
const date = require('date-and-time');
const now = new Date;
// console.log(date.format(now, 'YYYY/MM/DD HH:mm:ss'));

const scheduleSchema = mongoose.Schema({
    EmpID: {
        type: Array,
        required: true
    },
    CurrDate: {
        type: String,
        required: true
    },
    Entry: {
        type: Date,
        required: false
    },
    Exit: {
        type: Date,
        required: false
    },
    Location: {
        type: String,
        default: "Not Specified"
    },
    Description: {
        type: String,
        default: 0
    }
});

module.exports = mongoose.model('ScheduleDB', scheduleSchema);