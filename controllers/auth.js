const User=require('../models/user');
const nodemailer=require('nodemailer');
const bcrypt=require('bcryptjs');
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'matilde24@ethereal.email',
        pass: 'VztcuhzK8pDfT1WHYJ'
    }
});
exports.getLogin=(req,res,next)=>{
    // const isLoggedIn=req.get('Cookie')[0].trim().split('=')[1]=='true';//not recommended as cookie value can be altered by anyone at  client side
    
    
            res.render('auth/login',{
                doctitle: 'login',
                path:'/login',
                //  activeshop:true, 
                //  productsCSS:true,
                // errorMessage: req.flash('error')
                });

       
}
exports.getSignup=(req,res,next)=>{
    // const isLoggedIn=req.get('Cookie')[0].trim().split('=')[1]=='true';//not recommended as cookie value can be altered by anyone at  client side
    
    
            res.render('auth/signup',{
                doctitle: 'signup',
                path:'/signup',
                 activeshop:true, 
                 productsCSS:true,
                });

       
}
exports.postSignup=(req,res,next)=>{
    const email=req.body.email;
    const password=req.body.password;
    const confirmPassword=req.body.confirmPassword;
    User.findOne({email:email})
    .then(userDoc=>{
        if(userDoc){
            return res.redirect('/signup');
        }
        return bcrypt.hash(password,12)
            .then(hashedPassword=>{
                const user=new User({
                    email:email,
                    password:hashedPassword,
                    cart:{items:[]}
                })
                return user.save();
            });
    })
    
    .then(result=>{
        res.redirect('/login');

        return transporter.sendMail({
            to:email,
            from:'shop@gmail.com',
            subject:'signup succeeded',
            html:'<h1>You successfully signed up!</h1>'
        })
    })
    .catch(err=>{
        console.log(err);
    })
}
exports.postLogin=(req,res,next)=>{
    
    const email=req.body.email;
    const password=req.body.password;
    User.findOne({email:email})
    .then(user=>{
        if(!user){
            // req.flash("error","Invalid email or password");
            return res.redirect('/login');
        }
        bcrypt
        .compare(password,user.password)//returns a boolean value to then block either true or false
        .then(doMatch=>{
            if(doMatch){
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err => {
                    console.log(err);
                    res.redirect('/');
                });
            }
            // req.flash("error","Invalid email or password");
            res.redirect('/login');
        })
        .catch(err=>{
            console.log(err);
            res.redirect('/login');
        })

    })
    // res.setHeader('set-Cookie',' loggedIn=true');//setting a cookie...it stores a global variable in form of cookie
       
}
exports.postLogout=(req,res,next)=>{
            // req.session.destroy(err=>{
            //     if(err){
            //         console.log(err);
            //     }
            //     else
            //         {
            //             console.log("logout");
            //             req.end();
            //         res.redirect('/');}

            // });
req.session.destroy(err=>{
    if(err){
        console.log(err);
    }
    else{
        res.redirect('/');
        
    }
});
       
}
