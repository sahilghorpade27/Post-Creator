const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());



app.get("/",(req,res)=>{
    res.render("index");
});

app.post("/register" , async(req,res)=>{
    let {username , name , email , age , password} = req.body ;

    let user = await userModel.findOne({email}) ;
    if(user) return res.status(500).send("User already Registered , Please try with different email !!") ;

    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password , salt , async (err,hash)=>{
            let user = await userModel.create({
                username ,
                name ,
                age ,
                email ,
                password : hash ,
                         
            });
            let token = jwt.sign({email : email , userid: user._id},"shhhh");
            res.cookie("token", token);
            res.send("Registered");
        })      
    });

})                                             

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login" , async(req,res)=>{        // login using comparing the password and send cookie
    let {email, password} = req.body ;

    let user = await userModel.findOne({email}) ;
    if(!user) return res.status(500).send("User doesn't exist") ;
    bcrypt.compare(password,user.password , function(err, result) {
        if(result){
            let token = jwt.sign({email : email , userid: user._id},"shhhh");
            res.cookie("token", token);
            res.status(200).send("You can Login");            
        }
        else {
            res.redirect("/login");
        }
    });

});

app.get("/profile", isLoggedin , (req,res)=>{
    console.log(req.user);
});

app.get("/logout" , (req,res)=>{
    res.cookie("token","");
    res.redirect("/login");
})


function isLoggedin(req,res,next){        //yeh ek middle ware hai jo check karega profile route mai ki yeh insaan kon hai jo logged in hai
    if(req.cookies.token === "") res.send("You must be logged in");
    else {
        let data = jwt.verify(req.cookies.token , "shhhh");  //compare kiya ki kon hai using verify tokens 
        req.user = data ;
        next();
    }
    
    
}


app.listen(3000);