const express = require('express');
const date = require('date-and-time');
const router = express.Router();
const now = new Date;
const EmployDB = require('../models/employ');
const AdminDB = require('../models/admin');
const WorkDB = require('../models/work');
const ScheduleDB = require('../models/schedule');
const { update } = require('../models/employ');


//we are on employ side
router.get('/', (req, res)=>{
    res.send("We are on employ side");
});

// get all schedules for an particular ID (user)
router.get('/allSchedule/:ID', async (req, res)=>{
    const id = req.params.ID;
    try {
        const scheduleList = await ScheduleDB.find({EmpID: id});
        res.json(scheduleList);
    } catch (err) {
        res.json({message: err});
    }
    
});

//get all schedules of future and present for a particular ID(user)
router.get('/presentSchedule/:ID', async (req, res)=>{
    const id = req.params.ID;
    const threshold = date.format(now, 'YYYY/MM/DD'); 
    console.log(threshold);

    try {
        const scheduleList = await ScheduleDB.find({EmpID: id, CurrDate: {$gte: threshold}});
        res.json(scheduleList);
    } catch (err) {
        res.json({message: err});
    }
});

// to get all the work done by any ID(user)
// use WorkDB
router.get('/allDashBoard/:ID', async (req, res)=>{
    const id = req.params.ID;
    const threshold = date.format(now, 'YYYY-MM-DD');
    const thresholdWork = date.format(now, 'DD-YYYY-MM');

    const datenow = ("" + thresholdWork).slice(-7);

    
    try {
        //something need to discuss about the storage of work hours each day for any ID(user)
        const UserDetail = await EmployDB.findById({"_id": id})
        const ScheduleList = await ScheduleDB.find({EmpID: id, CurrDate: {$gte: threshold}}).sort({"Entry": 1});
        const workList = await WorkDB.find({EmpID: id});
        let hoursWorked=0, earning=0;
        
        console.log(datenow)
        await workList.forEach((element) => {
            if(element.Date.includes(datenow)){
                hoursWorked = hoursWorked + element.HoursWorkedToday;
                earning = earning + element.EarningToday;
            }
        })

        // console.log(datenow)

        res.status(200).json({user: UserDetail,TotalHoursWorked: hoursWorked, earningMonth: earning, schedules: ScheduleList})
    } catch (err) {
        res.json({message: err.message});
    }
});

// login route after scaning
router.post('/newWork/:ID', async (req, res)=>{
    const entry_time = date.format(now, 'YYYY-MM-DD HH:mm:ss');

    const person = await EmployDB.findById(req.params.ID);
    
    if(person.Logged) {
        return res.status(401).json("Already Logged In");
    }
    if(!person) {
        return res.status(402).json("Invalid QR Code");
    }
    const work = new WorkDB({
        EmpID: req.params.ID,
        EmpName: person.Name,
        EmpPhone: person.Phone,
        EmpEmail: person.Email,
        EmpSalaryPerHr: person.ChargePH,
        Date: date.format(now, 'YYYY-MM-DD'),
        Entry: Date.now(),
        Exit: "2022-08-07T10:24:03.000+00:00"
    });
    await work.save().
    then(data=>{
        res.json(data);
    }).catch(err=>{
        console.log(err);
    });

    // made that employ Logged = true
    person.Logged = true;
    await EmployDB.findByIdAndUpdate(req.params.ID,
        {$set: person},
        {new: true}
    );
    console.log(work);
    console.log(date.format(now, 'YYYY-MM-DD'));
});

//logout session after scaning
router.put('/editWork/:ID', async (req, res)=>{
    try{
        var chk = "2022-08-07T10:24:03.000+00:00";
        const newWork = await WorkDB.findOne({EmpID: req.params.ID, Exit: chk});
        const person = await EmployDB.findById(req.params.ID);
        if(!person) {
            return res.status(402).json("Invalid QR Code");
        }
        if(!newWork){
            return res.status(401).json("Not Found")
        }

        var exit_time = date.format(now, 'YYYY-MM-DD HH:mm:ss');
        var newvalues = { $set: { 
            Exit: Date.now(),
            HoursWorkedToday: ((Date.now() - new Date(newWork.Entry))/36e5),
            EarningToday: (((Date.now() - new Date(newWork.Entry))/36e5)*newWork.EmpSalaryPerHr),
        } };

        const updatedWork = await WorkDB.updateOne(newWork, newvalues)
        res.status(200).json(updatedWork);
        person.Logged = false;
        await EmployDB.findByIdAndUpdate(req.params.ID,
            {$set: person},
            {new: true}
        );
    }
    catch(err){
        res.json({message: err});
    }
});



module.exports = router;