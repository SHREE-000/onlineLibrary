 const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const { _router } = require("../../app");
const { response } = require("express");
const userOtpLoginHelper = require ('../../helpers/user_otpLogin')
const userLoginHelper = require ('../../helpers/user_login')
const service_sid = "VA2156cee5c46526aa31fc0f4c7e479e32";
const account_sid = "AC09273ea73c471737868e40c09eb30995";
const auth_token = "8ab008808b2a639adebca2ee49348509";
const client = require("twilio")(account_sid, auth_token);

router.use ( (req, res, next) => {

    if (req.session.user) {
        console.log(req.session.user);
        res.redirect ('/')
    }
    else {
        next ()
    }
    
})

router.get('/' , (req , res) => {

    const user_partial = "User partial"

    const errorMessage = req.session.errorMessage
    req.session.errorMessage = null
    const user = req.session.user
    req.session.user = null
    const userLoggedIn = req.session.userLoggedIn
    req.session.userLoggedIn = null
    res.render ('user/login' , {title : 'Bookleaves-login' , user , errorMessage , userLoggedIn , user_partial})
})

router.post('/' , (req , res) => {

    userLoginHelper.doUserLogin(req.body).then ( (response) => {
        
        if (response.status) {
            req.session.user = response.user
            req.session.userLoggedIn = true
            res.redirect ('/')
        }

        else {
            req.session.errorMessage = response.errorMessage
            res.redirect ('/u-login')
        }
    })
    
})

router.post('/u-login-otp', async (req, res) => {
    console.log(req.body);

    userOtpLoginHelper.doOtpLogin (req.body).then ( (data) => {
  
    req.session.user_number = req.body.user_number;
    if (data.status) {
        try{
        req.session.otpType = 'login'
        client.verify
        .services(service_sid)
        .verifications.create({
            to: `+91${req.session.user_number}`,
            channel: "sms",
          })
          
          .then((response) => {
              
              if (response.status === "pending") {
  
                      if (data.status) {
                          req.session.successMessage = data.successMessage
                          res.redirect("/u-otp");
                      }
  
                      else {
                          req.session.errorMessage = data.errorMessage
                          res.redirect("/u-login");
                      }
              }
                
          });
      }
    catch(error){
          console.log(error);
          res.redirect("/u-login");
      }
    }
    else {
        req.session.errorMessage = data.errorMessage
        res.redirect("/u-login");
    }
    })
  });


module.exports = router;