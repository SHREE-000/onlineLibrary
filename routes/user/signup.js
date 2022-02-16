const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const { _router } = require("../../app");
const { response } = require("express");
const user_signup_helpers = require("../../helpers/user_signup");
const service_sid = "VA2156cee5c46526aa31fc0f4c7e479e32";
const account_sid = "AC09273ea73c471737868e40c09eb30995";
const auth_token = "8ab008808b2a639adebca2ee49348509";
const client = require("twilio")(account_sid, auth_token);

router.use((req, res, next) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    next();
  }
});

router.get("/", async (req, res) => {

	const user_partial = "User partial"

  let errorMessage = req.session.errorMessage;
  req.session.errorMessage = null;

  res.render("user/signup", {
    errorMessage,
	user_partial,
    title: "Bookleaves-signup",
  });
});

router.post("/", async (req, res) => {
  console.log(req.body);
  req.session.signUpData = req.body;

  req.session.user_number = req.body.user_number;
  try{
	req.session.otpType = 'signup'
	  client.verify
	  .services(service_sid)
	  .verifications.create({
		  to: `+91${req.session.user_number}`,
		  channel: "sms",
		})
		
		.then((response) => {
			
			if (response.status === "pending") {

				user_signup_helpers.doUserSignup (req.body).then ( (data) => {

					if (data.status) {
						req.session.successMessage = data.successMessage
						res.redirect("/u-otp" ,);
					}

					else {
						req.session.errorMessage = data.errorMessage
						res.redirect("/u-signup");
					}
				})
			}
				// res.redirect("/u-otp");
			// } else {
			// 	req.session.errorMessage = "Sending OTP Failed , Please Try Again Later";
			// 	req.session.errorMessage = response.errorMessage;
			// 	res.redirect("/u-signup");
			// }
		});
	}catch(error){
		console.log(error);
		res.redirect("/u-signup");
	}
});

module.exports = router;
