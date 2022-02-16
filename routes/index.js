const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require ('../helpers/admin_product')
var moment = require ('moment')
const paypal = require('paypal-rest-sdk'); 
const { resolve } = require('promise');


paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AdY0khx1uxYu4HS3UJsnt_-AgNUCy2PsV6PbvX8W66fbLedU699d4WVYIZEq2k988aBgm-MUP_pGynkq',
  'client_secret': 'EHvW5lXVGsh92R6nsEmjAeY0B3vv24YUTeqtgsIfMQi6v69ArYqc9A0eHUY6uDm3OiHwVhgKKM5j4afQ'
});


const verifyLogin = ( (req,res,next) =>{

  if(req.session.user) {
    next()
  }
  else {
    res.redirect('/u-login')
  }
})

/* GET home page. */
router.get('/',  async(req, res, next) => {

  const bookDetails = await productHelpers.getAllProduct()
  const book = bookDetails.book 
  
  let details = await productHelpers.findFirstBanner()
  let firstBannerDetails = details.firstBanner
  let cartCount = null
  let totalRate = null
  let shiprate
  let onBook 
  let oneBook
  

  if (req.session.user) {
  cartCount = await productHelpers.getCartCount(req.session.user._id) 
  shiprate = await productHelpers.findDeliveryRate() 
  onBook = await productHelpers.getCartItem(req.session.user._id)
  oneBook = onBook[0]
  }
 
  totalRate = cartCount * shiprate

  const secondBannerr = await productHelpers.findSecondBanner()
  const secondBanner = secondBannerr.secondBanner
  let detailss = await productHelpers.findAuthorBanner()
  let authorBannerDetails = detailss.authorBanner
  let promotiondetails = await productHelpers.findpromotionBanner()
  let promotionBannerDetails = promotiondetails.promotionBanner
  let lastdetails = await productHelpers.findpromotionLast()
  let lastpromotionBannerDetails = lastdetails.lastpromotionBanner 
  let coupondetails = await productHelpers.findCouponBanner()
  let couponBannerDetails = coupondetails.couponBanner
  let findCategory = await productHelpers.findCategory() 
  let category = findCategory.category
  
  
 

  const user = req.session.user
  res.render('index', {  title: 'Bookleaves' , user , book , user_partial : true ,  
  authorBannerDetails , firstBannerDetails , secondBanner , promotionBannerDetails , 
  lastpromotionBannerDetails , cartCount , couponBannerDetails , category ,
   totalRate ,shiprate , oneBook});

  
});


// logout router

router.get ('/u-logout' , (req,res) => {
  req.session.user = null
  res.redirect('/u-login')
})

// product details page

router.get('/product-details/:id', (req , res) => {

  const id = req.params.id

  productHelpers.findOneProduct(id).then( (response) => { 
    const oneBook = response.oneBook
    res.render('user/product-details', {user_partial : true , oneBook, user : req.session.user})
  })
})

// add to cart

router.get('/cart', verifyLogin , async(req,res) =>{
  
  let cartCount = null
  let totalRate = null
  let shiprate
  let onBook 
  let oneBook
  

  if (req.session.user) {
  cartCount = await productHelpers.getCartCount(req.session.user._id) 
  shiprate = await productHelpers.findDeliveryRate() 
  onBook = await productHelpers.getCartItem(req.session.user._id)
  oneBook = onBook[0]
  }
 
  totalRate = cartCount * shiprate
 

  res.render('user/cart', {user_partial : true, oneBook , user : req.session.user, shiprate , cartCount , totalRate})
})


 router.get('/add-to-cart/:id'  ,async (req,res) => {
  await productHelpers.addCart(req.params.id , req.session.user._id)
  let shiprate = await productHelpers.findDeliveryRate()  
  let cartCount = await productHelpers.getCartCount(req.session.user._id)
  let onBook = await productHelpers.getCartItem(req.session.user._id)
  let oneBook = onBook[0]
  let totalRate = cartCount * shiprate
   res.json({status:true , oneBook , totalRate ,shiprate , cartCount}) 
  })

 router.post('/delete-cart-product', (req,res) => {
   productHelpers.deleteCart(req.body.proId , req.session.user._id).then( (response) => {
     res.json({status:true})
   })
 })



// Profile Page - add ,  edit , delete address


// edit profile

router.get('/edit-profile',verifyLogin, async(req,res) => {

  let cartCount = null
  let totalRate = null
  let shiprate
  let onBook 
  let oneBook
  

  if (req.session.user) {
  cartCount = await productHelpers.getCartCount(req.session.user._id) 
  shiprate = await productHelpers.findDeliveryRate() 
  onBook = await productHelpers.getCartItem(req.session.user._id)
  oneBook = onBook[0]
  }
 
  totalRate = cartCount * shiprate

res.render('user/edit-profile' , {user_partial : true , user : req.session.user , cartCount , totalRate , oneBook})
})

// add profile

router.get('/add-profile',verifyLogin, async(req,res) => {

  let cartCount = null
  let totalRate = null
  let shiprate
  let onBook 
  let oneBook
  

  if (req.session.user) {
  cartCount = await productHelpers.getCartCount(req.session.user._id) 
  shiprate = await productHelpers.findDeliveryRate() 
  onBook = await productHelpers.getCartItem(req.session.user._id)
  oneBook = onBook[0]
  }
 
  totalRate = cartCount * shiprate



res.render('user/add-profile' , {user_partial : true , user : req.session.user , cartCount , oneBook , totalRate})
})


router.post('/add-profile', async(req,res) => {

    if (req.session.user) {
    await productHelpers.addAddress(req.body , req.session.user._id).then ( (response) => {
      req.session.errorMessage = response.errorMessage
      req.session.successMessage = response.successMessage
      req.session.addressId = response.addressId

     

    }) }
res.redirect('/user-profile' )
})

// add profile in checkout page

router.post('/add-profile-checkout', async(req,res) => {

    if (req.session.user) {
    await productHelpers.addAddress(req.body , req.session.user._id).then ( (response) => {
      req.session.errorMessage = response.errorMessage
      req.session.successMessage = response.successMessage
      req.session.addressId = response.addressId

     

    }) }
res.redirect('/checkout' )
})

// user profile


router.get('/user-profile',verifyLogin, async(req,res) => {

  const errorMessage = req.session.errorMessage
  req.session.errorMessage = null
  const successMessage = req.session.successMessage
  req.session.successMessage = null

  

  let cartCount = null
  let totalRate = null
  let shiprate
  let onBook 
  let oneBook
  

  if (req.session.user) {
  cartCount = await productHelpers.getCartCount(req.session.user._id) 
  shiprate = await productHelpers.findDeliveryRate() 
  onBook = await productHelpers.getCartItem(req.session.user._id)
  oneBook = onBook[0]
  }
 
  totalRate = cartCount * shiprate

    await productHelpers.getUserAddress(req.session.user._id).then( (response) => {
      address = response
    })
    
   

res.render('user/user-profile' , {user_partial : true , user : req.session.user , cartCount , totalRate ,
   errorMessage , successMessage ,oneBook , address})
})

// delete address

router.get('/delete-profile/:id', async (req,res) => {

  if (req.session.user) {
  await productHelpers.deleteAddress(req.session.user._id , req.params.id).then( (response) => {
    
    req.session.successMessage =  response
  })
  }
  res.redirect('/user-profile')
}) 

// edit address

router.get('/edit-profile/:id',verifyLogin, async(req,res) => {


  let cartCount = null
  let totalRate = null
  let shiprate
  let onBook 
  let oneBook
  

  if (req.session.user) {
  cartCount = await productHelpers.getCartCount(req.session.user._id) 
  shiprate = await productHelpers.findDeliveryRate() 
  onBook = await productHelpers.getCartItem(req.session.user._id)
  oneBook = onBook[0] 
  }
  addressDetails = await productHelpers.getOneAddress(  req.params.id , req.session.user._id  ) 


 
  totalRate = cartCount * shiprate

res.render('user/edit-profile' , {user_partial : true , user : req.session.user , cartCount , totalRate ,
   addressDetails ,  oneBook })
})



router.post('/edit-profile' , async(req,res) => {
  if (req.session.user) {
    const message = await productHelpers.editAddress(req.session.user._id , req.body)

    req.session.successMessage = message.successMessage

  }
  res.redirect('/user-profile')
})

// place order

router.get('/place-order',verifyLogin, async(req,res) => {
  const user = await productHelpers.getUser(req.session.user._id)
  const userId = user._id
  let rent = false
  await productHelpers.destroyCart(userId)
   .then( (response) => {
     if(response.status) {
       rent = true
     }
   })
  res.render('user/place-order', { user : req.session.user , user_partial : true , rent })
})


// view orders

router.get('/view-order',verifyLogin , async (req,res) => {
  const succesMessage = req.session.succesMessage
  req.session.succesMessage = null
 const orders = await productHelpers.userOrderDetails(req.session.user._id)


 for( x of orders) {
   x.date = moment (x.date).format("ll")
 }
    res.render('user/view-order',{user : req.session.user , succesMessage ,  user_partial : true  , orders})

  })

  // cancell orderd books

  router.get('/cancel-order/:id' , verifyLogin , async (req,res) => {
    
    id = req.params.id
 
    const msg = await productHelpers.changePaymentStatusByUser(req.session.user._id , id)
    req.session.successMessage = msg
    res.redirect('/view-order')
  })

  // ordered book details

  router.get('/order-book-details' ,verifyLogin, async (req,res) => {
  
 const orders = await productHelpers.userOrderDetails(req.session.user._id)

 for( x of orders) {
  x.date = moment (x.date).format("ll")
}

    res.render('user/order-book-details', {user : req.session.user , user_partial : true  , orders})
  })

  // add , edit , delete profile page not address

  router.get('/profile', verifyLogin, async(req,res) =>{

   
    let cartCount = null
    let totalRate = null
    let shiprate
    let onBook 
    let oneBook
    
  
    if (req.session.user) {
    cartCount = await productHelpers.getCartCount(req.session.user._id) 
    shiprate = await productHelpers.findDeliveryRate() 
    onBook = await productHelpers.getCartItem(req.session.user._id)
    oneBook = onBook[0] 
    }

  
    totalRate = cartCount * shiprate

    let userData

    await productHelpers.getUser(req.session.user._id).then( (response) => {
      userData = response
    })

      
     
      const user = req.session.user

      const successMessage = req.session.successMessage
      req.session.successMessage = null

   
    res.render('user/profile' , {user_partial : true , user : req.session.user, userData , oneBook , totalRate , cartCount , shiprate , user , successMessage})
  })

  router.post('/profile', async(req,res)=> {

    

    res.redirect('/editProfile')
  })


   // edit true profile page

  router.get('/editProfile',verifyLogin, async (req,res) => {

    console.log( req.session.profileId  , "edit profile from router");
    req.session.profileId = null

    let cartCount = null
    let totalRate = null
    let shiprate
    let onBook 
    let oneBook
  
    if (req.session.user) {
    cartCount = await productHelpers.getCartCount(req.session.user._id) 
    shiprate = await productHelpers.findDeliveryRate() 
    onBook = await productHelpers.getCartItem(req.session.user._id)
    oneBook = onBook[0] 
    }
      totalRate = cartCount * shiprate

    const user = await productHelpers.getUser(req.session.user._id)
 

    res.render('user/editProfile', {user, user_partial : true , oneBook , shiprate , user : req.session.user, onBook ,totalRate })
  })

  router.post('/editProfile',verifyLogin, async (req,res) => {



    const id = req.session.user._id

    const image1 = req.files.image1
  
    if (image1) {
      image1.mv('./public/profile-images/' + id + '.jpeg')
    }


    req.session.successMessage = await productHelpers.updateUserData(req.session.user._id , req.body)

    res.redirect('/profile')
  })

  // Subscription Plans

  router.get('/subscription', verifyLogin , async(req,res) => {
    const subscription_plans = await productHelpers.findPlans()
    res.render('user/subscription' , {user_partial : true , subscription_plans , user : req.session.user})
  })

  router.post('/subscription', verifyLogin ,async(req,res) => {

   
    const plan = await productHelpers.findOnePlan(req.body)
    req.session.rate = req.body.subscription_rate
    req.session.plan = plan.planTitle 

    res.redirect('/checkout-subscription')
  })


  //  checkout page

router.get('/checkout', verifyLogin , async(req,res) => {
  
  let cartCount = null
  let totalRate = null
  let shiprate
  let onBook 
  let oneBook
  let  errorMessage

  user_details = await productHelpers.getUser(req.session.user._id)


  const successMessage = req.session.successMessage
  req.session.successMessage = null
  errorMessage = req.session.errorMessage
  req.session.errorMessage = null 
  

  if (req.session.user) {
  cartCount = await productHelpers.getCartCount(req.session.user._id) 
  shiprate = await productHelpers.findDeliveryRate() 
  onBook = await productHelpers.getCartItem(req.session.user._id)
  oneBook = onBook[0]
  }
 
  totalRate = cartCount * shiprate
    
    await productHelpers.getUserAddress(req.session.user._id).then( (response) => {
      address = response
    })
  
  if (totalRate === 0) {
    errorMessage = "You haven't place any order"
  }

 

  res.render('user/checkout', {user_partial : true , cartCount , errorMessage ,user_details ,
     successMessage ,totalRate ,oneBook , shiprate , address , user : req.session.user} )
})



router.post('/checkout',verifyLogin, async(req,res) => {

  let shiprate = await productHelpers.findDeliveryRate()

  let onBook
  let oneBook
  let cartCount = null
  let deliveryAddress


  if (req.session.user) {
    cartCount = await productHelpers.getCartCount(req.session.user._id)
     onBook = await productHelpers.getCartItem(req.session.user._id)
     oneBook = onBook[0].cartItems 
     bookId = onBook[0].user

     
     
    await productHelpers.getCheckoutAddress(req.session.user._id , req.body.selectAddress).then( (response) => {
      deliveryAddress = response
    })
  }
  totalRate = cartCount * shiprate
  
  
  await productHelpers.checkOut(req.body , req.session.user._id , deliveryAddress , oneBook , totalRate ,shiprate, bookId ,cartCount).then( (placeId) => {
    req.session.successMessage = placeId.successMessage
    req.session.errorMessage = placeId.errorMessage 
    
    const id = placeId.id 
    
    if (req.body['payment'] === 'COD') {
      res.json({COD_Success : true})
    }
    else if (req.body['payment'] === 'RazorPay') {
      productHelpers.generateRazorpay(id , totalRate).then( (response)=> {
        res.json(response)
      })
    }
    else {
        // req.sesson.id = id
        console.log(req.body , "from paypal");
        res.json({payPal_success : true})

    }

  })
})

// verify payment razorpay

router.post('/verify-payment',async (req,res) => {
  
  console.log(req.body , " body from verify-payment");


  await productHelpers.verifyPayment(req.body).then( (response) => {
 
    productHelpers.changePaymentStatus(req.body['order[receipt]']).then( (response) => {
      
      res.json({status : true})
    })

  }).catch( (err) =>{
    console.log(err);
    res.json({status : false , errorMessage : "Payment Failed Unexpectedly"})
  })
})

// verify payment paypal

router.get('/payPal', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "001",
                "price": "25.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "25.00"
        },
        "description": "Hat for the best team ever"
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
  }
});

});

router.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "25.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.redirect('/place-order');
    }
});
});

router.get('/cancel', (req, res) => res.send('Cancelled'));



  // Check out page for subscription

  router.get('/checkout-subscription',verifyLogin , async(req,res) => {
    const subscription_rate = req.session.rate
   
    const subscription_plan = req.session.plan
   
    res.render('user/checkout-subscription', {user_partial : true , subscription_rate , subscription_plan , user : req.session.user})
  })

  router.post('/checkout-subscription', verifyLogin , async(req,res) => {

    const subscription_rate = req.session.rate
    req.session.rate = null
    const subscription_plan = req.session.plan
    req.session.plan = null
    let validity = null
    let yearly_rate = null
    
    let plan = await productHelpers.findPlans()

    await plan.map( (result) => {

      if (result.monthlyRate == subscription_rate) {
        validity = "month"
      }
      else if (result.yearlyRate == subscription_rate) {
        validity = "year"
      }
      else {
          console.log("value not found");
      }
  })

    console.log(req.body , "body from check out post method");


    const orderId = await productHelpers.checkOut_subscription(req.session.user._id  , req.body , subscription_rate , subscription_plan , validity)
    
   
      if (req.body.payment == 'RazorPay') {
          await productHelpers.generateRazorPayForPlan(orderId , subscription_rate).then( (response) => {
            console.log(response , "response from check out post");
            response.status = true
          res.json(response)
          })
    }
    if ( req.body.payment == 'PayPal' ) {
      res.json({response : false})
    }
     
  
  
    // res.json({status : false , subscription_rate , orderId})
})

// verify payment razorpay for subscription plan

router.post('/verify-payment-subsciption',async (req,res) => {


  await productHelpers.verifyPaymentSubscription(req.body).then( (response) => {
 
    productHelpers.changePaymentStatusForSubscription(req.body['order[receipt]']).then( (response) => {
      
      res.json({status : true})
    })

  }).catch( (err) =>{
    console.log(err);
    res.json({status : false , errorMessage : "Payment Failed Unexpectedly"})
  })

})


// contact form

router.get('/contact', verifyLogin , (req,res) => {
  res.render('user/contact', {user_partial : true , user : req.session.user})
})


  


module.exports = router;
