const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const post = require("./models/post");
const multer = require('multer')
const path = require("path");
const crypto = require("crypto");
const upload = require("./config/multerconfig");
const { log } = require("console");
const { loadEnvFile } = require("process");
const user = require("./models/user");

app.use(express.static(path.join(__dirname , "public")));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());




app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/profile/upload",(req,res)=>{
    res.render("profileupload");
});

app.post("/upload", isLoggedin, upload.single("image"), async (req,res)=>{
    let user = await userModel.findOne({email : req.user.email})
    user.profilepic = req.file.filename ;
    await user.save();
    res.redirect("/profile");
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
            res.status(200).redirect("/profile");            
        }
        else {
            res.redirect("/login");
        }
    });

});

app.get("/profile", isLoggedin , async(req,res)=>{
    let user =  await userModel.findOne({email : req.user.email}).populate("posts");
    
    res.render("profile",{user});
    
});

app.post("/post", isLoggedin , async(req,res)=>{
    let user =  await userModel.findOne({email : req.user.email});
    let {content} = req.body ;
    
    let post = await postModel.create({
        user : user._id ,
        content 
    })
    user.posts.push(post._id);
    await user.save() ;
    res.redirect("/profile")    
});

app.get("/like/:id", isLoggedin , async(req,res)=>{
    let post =  await postModel.findOne({_id: req.params.id}).populate("user");

    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.userid),1);
    }
    
    await post.save();
    res.redirect("/profile");
});

app.get("/edit/:id", isLoggedin , async(req,res)=>{
    let post =  await postModel.findOne({_id: req.params.id});
    res.render("edit" , {post});
});

app.post("/update/:id", isLoggedin , async(req,res)=>{
    let post =  await postModel.findOneAndUpdate({_id: req.params.id } , {content : req.body.content}) ;
    res.redirect("/profile");
});

app.get("/logout" , (req,res)=>{
    res.cookie("token","");
    res.redirect("/login");
});

function isLoggedin(req,res,next){        //yeh ek middle ware hai jo check karega profile route mai ki yeh insaan kon hai jo logged in hai
    if(req.cookies.token === "") {
        return res.redirect("/login");
    }
    else {
        let data = jwt.verify(req.cookies.token , "shhhh");  //compare kiya ki kon hai using verify tokens 
        req.user = data ;
        next();
    }
    
    
}


app.listen(3000);