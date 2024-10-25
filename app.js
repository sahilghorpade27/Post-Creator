const express = require("express");
const app = express();
const userModel = require("./models/user");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get("/",(req,res)=>{
    res.render("index");
});

app.post("/register" , async(req,res)=>{
    let {username , name , email , age , password} = req.body ;
    let user = userModel.findOne({email}) ;
    if(user) return res.status(500).send("User already Registered , Please try with different email !!") ;

})

app.listen(3000);