const express = require('express');
const date = require("date-and-time");
const router = express.Router();
const now = new Date;
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const EmployDB = require('../models/employ');
const AdminDB = require('../models/admin');
const WorkDB = require('../models/work');
const ScheduleDB = require('../models/schedule');
const asyncHandler = require("express-async-handler");
const authorisation = require("../authorisation");
const tokenGen = require('../tokengen');
const {body, validationResult} = require("express-validator");
const { response } = require('express');

// home page on admin side
router.get('/', (req, res)=>{
    res.send("We are on admin side");
});


//get all employs list 
router.get('/allEmploy', async (req, res)=>{
    try {
        const employList = await EmployDB.find({});
        res.json(employList);
    } catch (err) {
        res.json({message: err});
    }
});

//get all employs list 
router.get('/allWorkingEmploy', async (req, res)=>{
    try {
        const employList = await EmployDB.find({Logged: true});
        res.json(employList);
    } catch (err) {
        res.json({message: err});
    }
});

//get employ with particular ID
router.get('/Employ/:ID', async (req, res)=>{
    try {
        const employList = await EmployDB.findById({"_id": req.params.ID});
        res.json(employList);
    } catch (err) {
        res.json({message: err});
    }
})

// POST request for new employ
router.post('/newEmploy', async (req, res)=>{
    const employ = new EmployDB({
        Name: req.body.Name,
        Phone: req.body.Phone,
        Email: req.body.Email,
        Address: req.body.Address,
        ChargePH: req.body.ChargePH,
        Designation: req.body.Designation,
        Active:req.body.Active,
        DateOfHire: req.body.DateOfHire
    });

    await employ.save()
    .then(data =>{
        res.json(data);
    })
    .catch(err =>{
        console.log(err);
    });
});

//PUT request for editing employ details
//with this we can handle active 
router.put('/editEmploy/:ID', async (req, res)=>{
    try{
        const { Name, Phone, Email, Address, ChargePH, Designation, Active} = req.body;

        const newEmploy = {};

        if(Name){
            newEmploy.Name = Name
        }
        if(Phone){
            newEmploy.Phone = Phone
        }
        if(Email){
            newEmploy.Email = Email
        }
        if(Address){
            newEmploy.Address = Address
        }
        if(ChargePH){
            newEmploy.ChargePH = ChargePH
        }
        if(Designation){
            newEmploy.Designation = Designation
        }
        if(Active !== undefined && Active !== null){
            newEmploy.Active = Active
        }

        const Employ = await EmployDB.findById(req.params.ID);
        if(!Employ){
            return res.status(401).json("Not Found")
        }

        const updatedEmploy = await EmployDB.findByIdAndUpdate(req.params.ID,
            {$set: newEmploy},
            {new: true}
        );
        res.json(updatedEmploy);
    }
    catch(err){
        res.json({message: err});
    }
});

//delete an user
router.delete('/delete/:ID', async (req, res)=>{
    const Employ = await EmployDB.findById(req.params.ID);
    if(!Employ){
        return res.status(401).json("Not Found")
    }
    try{
        await EmployDB.findByIdAndDelete(req.params.ID);
        res.send(Employ);
    } catch(err) {
        res.send({message: err});
    }
});

// scheduling any task for any person
// date.format(now, 'YYYY/MM/DD HH:mm:ss')
router.post('/addSchedule', async (req, res)=>{
    const schedule = new ScheduleDB({
        EmpID: req.body.EmpID,
        CurrDate: req.body.CurrDate,
        Entry: req.body.Entry,
        Exit: req.body.Exit,
        Location: req.body.Location,
        Description: req.body.Description
    });

    await schedule.save()
    .then(data =>{
        res.json(data);
    })
    .catch(err =>{
        console.log(err);
    });
});

//editing any schedule with given schedule ID
router.put('/editSchedule/:ID', async (req, res)=>{
    try{
        const {EmpID, CurrDate, Entry, Exit, Location, Description} = req.body;

        const newSchedule = {};

        if(EmpID){
            newSchedule.EmpID = EmpID
        }
        if(CurrDate){
            newSchedule.CurrDate = CurrDate
        }
        if(Entry){
            newSchedule.Entry = Entry
        }
        if(Exit){
            newSchedule.Exit = Exit
        }
        if(Description){
            newSchedule.Description = Description
        }
        if(Location){
            newSchedule.Location = Location
        }

        const Employ = await ScheduleDB.findById(req.params.ID);
        if(!Employ){
            return res.status(401).json("Not Found")
        }

        const updatedSchedule = await ScheduleDB.findByIdAndUpdate(req.params.ID,
            {$set: newSchedule},
            {new: true}
        );
        res.json(updatedSchedule);
    }
    catch(err){
        res.json({message: err});
    }
});


// get all schedules for a particular date
// date.format(now, 'YYYY-MM-DD')
router.get('/dateSchedule/:date', async (req, res)=>{
    const date = req.params.date;
    // console.log(date);

    try {
        const ScheduleList = await ScheduleDB.find({CurrDate: date});
        res.json(ScheduleList);
    } catch (err) {
        res.send({message: err});
    }
});

// get future and current schedule for particular ID
// ID of backend user in string format`
router.get('/idPresentSchedule/:ID', async (req, res)=>{
    const id = req.params.ID;
    const threshold = date.format(now, 'YYYY-MM-DD');
    // console.log(threshold);
    
    try {
        const ScheduleList = await ScheduleDB.find({EmpID: id, CurrDate: {$gte: threshold}});
        res.json(ScheduleList);
        // console.log(ScheduleList);
    } catch (err) {
        console.log(err);
        res.send({message: err});
    }
});

router.get('/allPresentSchedule', async (req, res)=>{
    const threshold = date.format(now, 'YYYY-MM-DD');
    // console.log(threshold);
    
    try {
        const ScheduleList = await ScheduleDB.find({CurrDate: {$gte: threshold}}).sort({"Entry": 1});
        res.json(ScheduleList);
        // console.log(ScheduleList);
    } catch (err) {
        console.log(err);
        res.send({message: err});
    }
});

// to get all the schedules for a paticular ID
router.get('/idAllSchedule/:ID', async (req, res)=>{
    const id = req.params.ID;
    
    try {
        const ScheduleList = await ScheduleDB.find({EmpID: id}).sort({"Entry": 1});
        res.json(ScheduleList);
        // console.log(ScheduleList);
    } catch (err) {
        console.log(err);
        res.send({message: err});
    }
});

// delete a schedule with given ID
router.delete('/deleteSchedule/:ID', async (req, res)=>{
    const id = req.params.ID;

    try {
        const schedule = await ScheduleDB.findById(id);

        if(schedule){
            await ScheduleDB.findByIdAndDelete(id);
            res.send(schedule);
        }
        else return res.status(401).json("Not Found")
    } catch (err) {
        res.json({message: err});
    }
});

// excel sheet for an employ on date yyyy-mm
router.get('/excel/:ID/:date', async (req, res)=>{
    try {
        const id = req.params.ID;
        const date = req.params.date;
    
        const workList = await WorkDB.find({EmpID: id});
        const reqList = [];
        workList.forEach(element => {
            if(element.Date.includes(date)){
                reqList.push(element);
            }
        });
        res.json(reqList);
    } catch (error) {
        console.log(error)
    }
});

// excel sheet for an employ on date yyyy-mm
router.get('/excelattendence/:date', async (req, res)=>{
    try {
    const date = req.params.date;

    const workList = await WorkDB.find({});
    const reqList = [];
    workList.forEach(element => {
        if(element.Date.includes(date)){
            reqList.push(element);
        }
    });
    res.json(reqList);
} catch (error) {
    console.log(error)
}
});

// excel sheet for an employ on date yyyy-mm
router.get('/getWorkInfo/:ID/:date', async (req, res)=>{
    try {
    const id = req.params.ID;
    const date = req.params.date;

    const workList = await WorkDB.find({EmpID: id});
    var hrsworked=0, totalearning=0;
    workList.forEach(element => {
        if(element.Date.includes(date)){
            hrsworked += element.HoursWorkedToday;
            totalearning += element.EarningToday;
        }
    });
    res.send({workedTime: hrsworked, earning: totalearning});
} catch (error) {
    console.log(error)
}
});

// excel sheet for an employ on date yyyy-mm
router.get('/getDashboardData', async (req, res)=>{
    try {
        const threshold = date.format(now, 'YYYY-MM-DD');


    const userList = await EmployDB.find({});
    const scheduleTodayList = await ScheduleDB.find({CurrDate: {$gte: threshold}});
    var activeUserCount=0, loggedUserCount=0, scheduleCount = scheduleTodayList.length;
    userList.forEach(element => {
        if(element.Active){
            activeUserCount++;
        }
        if(element.Logged){
            loggedUserCount++;
        }
    });
    res.send({userCount: activeUserCount, loggedUser: loggedUserCount, ScheduleCountToday: scheduleCount});
} catch (error) {
    console.log(error)
}
});





// ------------- all tested till now -------------------

router.post('/verifyUserToken', async (req, res)=>{
    try {
        
    const toverify = req.body.token;
    const e_mail = req.body.email;
    // console.log(toverify)
    let statusveried=404;

    const user = await AdminDB.find({email: e_mail})

    if(user.currToken === toverify){
        statusveried = 200;
    }
    return res.status(statusveried).json({ success: "Verification done"});
        
    } catch (error) {

        console.log(error);
        response.status(500).send("Internal Error")
        
    }
});


router.post("/login",[
    body("email", "Enter a valid email address").isEmail(),
    body("password", "Password cannot be blank").exists(),
],async(req, res) => {
    let success = false ;
    // return errors if any :
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    // yahan destructuring kra
    const {email, password} = req.body ;
    try {
        let user = await AdminDB.findOne({email}) ;
        if(!user) {
            return res.status(401).json({success, error : "Please try to login with correct credentials", user}) ;
        } 

        const passwordCompare = await bcrypt.compare(password , user.password) ;
        if(!passwordCompare) {
            return res.status(403).json({success, error : "Please try to login with correct credentials", user}) ;
        }

        const data = {
            user:{
                id: user.id
            }
        }
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY);
        user.currToken = authToken;
        // user.save()
        AdminDB.updateOne({"_id": user._id}, {$set:{"currToken":authToken}})
        success = true ;
        res.json({success, authToken, user})

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/register", asyncHandler(async (req, res) => {
    const userData = req.body;
    // console.log(userData.name);
    const userExist = await AdminDB.findOne({ email: userData.email });
    if (userExist) {

        throw new Error("User Already Exists");
    } else {
        const createUser = await AdminDB.create(userData);
        // createUser.token = generateToken(createUser._id);
        console.log(createUser);
        res.send(createUser);
        // console.log(createUser.token);
    }
})
);


module.exports = router;