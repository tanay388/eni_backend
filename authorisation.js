const asyncHandler= require("express-async-handler");
const jwt=require("jsonwebtoken");
const AdminDB = require("./models/admin");
require('dotenv/config');

const authorisation= asyncHandler(async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token= req.headers.authorization.split(' ')[1];
            const decode=jwt.verify(token,process.env.JWT_SECRET_KEY);
            const userdetails=await AdminDB.findById(decode.id);
            req.userdetails=userdetails;
            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not Authorised");
        }
    }
});
module.exports=authorisation;