const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const { _router } = require("../../app");
const { response } = require("express");
const userOtpHelper = require("../../helpers/user_otp");
const service_sid = "VA2156cee5c46526aa31fc0f4c7e479e32";
const account_sid = "AC09273ea73c471737868e40c09eb30995";
const auth_token = "8ab008808b2a639adebca2ee49348509";
const client = require("twilio")(account_sid, auth_token);
const userOtpLoginHelper = require("../../helpers/user_otpLogin");

router.use(
  cors({
    origin: "*",
  })
);

router.use(bodyParser.json());

router.get("/", (req, res) => {
  const user_partial = "User partial";

  const errorMessage = req.session.errorMessage;
  req.session.errorMessage = null;
  const successMessage = req.session.successMessage;
  req.successMessage = null;
  res.render("user/otp", { errorMessage, successMessage, user_partial });
});

router.post("/", (req, res) => {
  const user_otp = req.body.user_otp;

  try {
    client.verify
      .services(service_sid)
      .verificationChecks.create({
        to: `+91${req.session.user_number}`,
        code: user_otp,
      })
      .then((verification_check) => {
        if (verification_check.status === "approved") {
          if (req.session.otpType == "login") {
            userOtpLoginHelper
              .doOtpLogin({ user_number: req.session.user_number })
              .then((data) => {
                req.session.user = data.user;
                req.session.userLoggedIn = true;
                res.redirect("/");
              });
          } else {
            userOtpHelper.doUserOtp(req.session.signUpData).then((response) => {
              req.session.user = response.user;
              req.session.userLoggedIn = true;
              res.redirect("/");
            });
          }
        } else {
          if (req.session.otpType == "login") {
            req.session.errorMessage = "Invalid OTP";
            res.redirect("/u-otp");
          } else {
            req.session.errorMessage = "Invalid OTP";
            res.redirect("/u-otp");
          }
        }
      });
  } catch (err) {
    req.session.errorMessage = "Invalid OTP";
    res.redirect("/u-otp");
  }
});

// resend otp after the timer

router.post("/resendOtp", (req, res) => {
  try {
    req.session.otpType = "login";
    client.verify
      .services(service_sid)
      .verifications.create({
        to: `+91${req.session.user_number}`,
        channel: "sms",
      })
      .then((response) => {
        if (response.status === "pending") {
          res.send(true);
        }
      });
  } catch (error) {
    console.log(error);
    res.send(false);
  }
});

module.exports = router;
