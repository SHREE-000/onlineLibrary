const db = require ('../config/connection')
const collection = require ('../config/collections')
const { ObjectId, Collection } = require ('mongodb')
const objectId = require ('mongodb').ObjectId
const { response } = require('express')
const { resolve, reject } = require('promise')
const { USER_ADDRESS_DATA } = require('../config/collections')
const Razorpay = require('razorpay')
const paypal = require('paypal-rest-sdk') 
const { LOADIPHLPAPI } = require('dns')
const { count } = require('console')
const { y } = require('pdfkit')

var instance = new Razorpay({
    key_id: 'rzp_test_4s8ud71AFs83mi',
    key_secret: '5FA8kbS3sETAUJvRNOoXXo7X'
  });
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AdY0khx1uxYu4HS3UJsnt_-AgNUCy2PsV6PbvX8W66fbLedU699d4WVYIZEq2k988aBgm-MUP_pGynkq',
    'client_secret': 'EHvW5lXVGsh92R6nsEmjAeY0B3vv24YUTeqtgsIfMQi6v69ArYqc9A0eHUY6uDm3OiHwVhgKKM5j4afQ'
  });

  

module.exports = {

doAdminCategory : (adminId , adminData) => {
    return new Promise (async (resolve , reject) => {

        const category = adminData.book_category

        const categoryData = {adminId , category}

        await db.get().collection(collection.ADMIN_CATEGORY_COLLECTION).insertOne(categoryData).then ( (data) => {
            return resolve ({status : true , categoryId : data.insertedId , successMessage : "Your Category Added Successfully"})
        })
    
    })
} ,

findCategory : () => {
    return new Promise (async (resolve , reject) => {

        const category = await db.get().collection(collection.ADMIN_CATEGORY_COLLECTION).find().toArray() 

            return resolve ( {status : true , category } )
        
    
    })
} ,

findSubCategory : (data) => {
    return new Promise (async (resolve , reject) => {
        const subCategory = await db.get().collection(collection.ADMIN_CATEGORY_COLLECTION).find({category : data}).project({_id:0,book_sub_category : 1}).toArray()
        resolve(subCategory[0].book_sub_category)
    })
},

deleteCategory : (categoryId) => {
    return new Promise (async (resolve , reject) => {

        await db.get().collection(collection.ADMIN_CATEGORY_COLLECTION).deleteOne({_id : objectId(categoryId)})

            return resolve ( {status : true , errorMessage : "Your category deleted successfully"} )
        
    
    })
} ,

doAdminSubCategory : (adminData) => {
    return new Promise (async (resolve , reject) => {

        await db.get().collection(collection.ADMIN_CATEGORY_COLLECTION).updateOne({ category : adminData.book_category} ,
        {$push : {
           
                book_sub_category : adminData.book_sub_category
                
            }
        }
    )
        resolve({successMessage : "Sub Category Added Successfully"})
    })
} ,

deleteSubCategory : (subcategoryData) => {
    return new Promise (async (resolve , reject) => {

        await db.get().collection(collection.ADMIN_SUB_CATEGORY_COLLECTION).deleteOne({book_sub_category : subcategoryData.book_sub_category})

            return resolve ( {status : true , errorMessage : "Your sub category deleted successfully "} )
        
    
    })
} ,

adminAddProduct : (productData) => {
    return new Promise (async (resolve , reject) => {

        db.get().collection(collection.ADMIN_BOOK_COLLECTION).insertOne(productData).then ( (data) => {
                    
            resolve ({status : true , productId : data.insertedId })
           
        })
    
    })
} ,

adminAddProductDate : (id) => {
    return new Promise (async (resolve , reject) => {
    await db.get().collection(collection.ADMIN_BOOK_COLLECTION).updateOne({ _id : objectId (id) },
    {
        $set : 
        {
            book_added_date : new Date()
        }
    })
    resolve()
})

} ,

getAllProduct : () => {
    return new Promise (async (resolve , reject) => {

        const book = await db.get().collection(collection.ADMIN_BOOK_COLLECTION).find().toArray()
            return resolve ({status : true , book})
        })
} ,

deleteProduct : (bookid) => {
    return new Promise (async (resolve , reject) => {
        console.log(objectId(bookid));

        db.get().collection(collection.ADMIN_BOOK_COLLECTION).deleteOne({_id:objectId(bookid)}).then((response) => {
            resolve({status : true , response})
        })
        })
} ,

viewProduct : (bookid) => {
    return new Promise (async (resolve , reject) => {
        console.log(objectId(bookid));

        const book = await db.get().collection(collection.ADMIN_BOOK_COLLECTION).findOne({_id:objectId(bookid)} )
            resolve({status : true , book})
        })
       
} ,

editProduct : (bookid , bookdata) => {
    return new Promise (async (resolve , reject) => {
        console.log(objectId(bookid));

        await db.get().collection(collection.ADMIN_BOOK_COLLECTION).updateOne({_id:objectId(bookid)} , {
            $set: {
                book_name : bookdata.book_name ,
                number_of_books : bookdata.number_of_books ,
                book_author : bookdata.book_author ,
                book_language : bookdata.book_language , 
                book_category : bookdata.book_category ,
                book_sub_category : bookdata.book_sub_category ,
                book_description : bookdata.book_description ,
                book_checkPremium : bookdata.book_checkPremium
            }
        }).then((response) => {
            resolve({status : true , response})
        })
            
        })
       
} ,

findOneProduct : (id) => {
    return new Promise (async (resolve , reject) => {
        const oneBook = await db.get().collection(collection.ADMIN_BOOK_COLLECTION).findOne({_id : ObjectId(id)})
        resolve({status : true , oneBook})
    })
} ,

addWishlist : (productId , userId) => {
    return new Promise (async (resolve , reject)  => {

        let bookCart = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({product : objectId(productId)})

        if(!bookCart) {

        const userCart = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user : objectId(userId)})

        if(userCart) {
                  
            await db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user : objectId(userId)} ,
            {
                $push : {
                    product : objectId(productId)
                }
            })
            resolve()
        }


        else {
            const cartObj = {
                user : objectId(userId) ,
                product : [objectId(productId)]
            }

            await db.get().collection(collection.WISHLIST_COLLECTION).insertOne(cartObj).then( (response))
            resolve()
        }
    }

    else {
        resolve({errorMessage : "You can order only one book at a time"})
    }

    })
} ,

addCart : (productId , userId) => {
    return new Promise (async (resolve , reject)  => {

        const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user : objectId(userId)})

        if(userCart) {
                  
            await db.get().collection(collection.CART_COLLECTION).updateOne({user : objectId(userId)} ,
            {
                $push : {
                    product : objectId(productId)
                }
            })
            resolve()
        }


        else {
            const cartObj = {
                user : objectId(userId) ,
                product : [objectId(productId)]
            }

            await db.get().collection(collection.CART_COLLECTION).insertOne(cartObj)
            resolve()
        }


    })
} ,

getCartItem : (userId) => {
    return new Promise (async (resolve, reject) => {
        const cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match : {
                    user : objectId(userId)
                }      
            },
                {
                    $lookup : {
                        from : collection.ADMIN_BOOK_COLLECTION , 
                        let : {productList : '$product'} ,  
                        pipeline : [{
                            $match : {
                                $expr : {
                                    $in : ['$_id' , "$$productList"]
                                }
                            }
                        }] ,
                        as : 'cartItems'
                    }
                }
        ]).toArray()
        
       
        resolve(cartItems)
    }) 
} ,

getWishItem : (userId) => {
    return new Promise (async (resolve, reject) => {
        const wishItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
            {
                $match : {
                    user : objectId(userId)
                }      
            },
                {
                    $lookup : {
                        from : collection.ADMIN_BOOK_COLLECTION , 
                        let : {productList : '$product'} ,  
                        pipeline : [{
                            $match : {
                                $expr : {
                                    $in : ['$_id' , "$$productList"]
                                }
                            }
                        }] ,
                        as : 'wishItems'
                    }
                }
        ]).toArray()
        
       
        resolve(wishItems)
    }) 
} ,

getWishlistCount : (userId) => {
    return new Promise( async(resolve , reject) => {

        const cart = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user : objectId(userId)})

        if (cart) {
             countt = cart.product.length               
        }
        else {
            countt = 0
        }
        resolve(countt)
        
    })
},

deleteWishlist : (productId,userId) => {
    return new Promise(async (resolve,reject) => {

        db.get().collection(collection.WISHLIST_COLLECTION).updateOne(
            {
            user : objectId(userId)
        },
        {
            $pull : {
                product : objectId(productId)
            }
        }
    )
    resolve()
    })
    
},

getCartCount : (userId) => {
    return new Promise( async(resolve , reject) => {

        const cart = await db.get().collection(collection.CART_COLLECTION).findOne({user : objectId(userId)})

        if (cart) {
             countt = cart.product.length               
        }
        else {
            countt = 0
        }
        resolve(countt)
        
    })
},

deleteCart : (productId,userId) => {
    return new Promise(async (resolve,reject) => {

        db.get().collection(collection.CART_COLLECTION).updateOne(
            {
            user : objectId(userId)
        },
        {
            $pull : {
                product : objectId(productId)
            }
        }
    )
    resolve()
    })
    
},
addDeliveryRate : (adminData) => {
    return new Promise (async (resolve , reject) => {

        await db.get().collection(collection.ADD_DELIVERY_RATE).insertOne(adminData).then ( (data) => {
            return resolve ({status : true , shippingId : data.insertedId , successMessage : "Your Shipping Charge Added Successfully"})
        })
    
    })
},

findDeliveryRate: () => {
    return new Promise (async (resolve , reject) => {

    let shipping = await db.get().collection(collection.ADD_DELIVERY_RATE).findOne({})
        let rate = parseInt(shipping.shipping_rate)
            resolve (  rate  )
        
    
    })
},

deleteDeliveryRate : (adminData) => {
    return new Promise (async (resolve , reject) => {

        await db.get().collection(collection.ADD_DELIVERY_RATE).deleteOne({shipping_rate : adminData.shipping_rate}).then (async (data) => {
            if (adminData.shipping_rate =="") {
                await db.get().collection(collection.ADD_DELIVERY_RATE).insertOne({shipping_rate : 100})
            }
            return resolve ({status : true , successMessage : "Your Shipping Charge Deleted Successfully"})
        })
    
    })
},

addFirstBanner : (adminData) => {
    return new Promise (async (resolve , reject) => {

        await db.get().collection(collection.FIRST_BANNER_DATA).insertOne(adminData).then ( (data) => {
            return resolve ({status : true , shippingId : data.insertedId , successMessage : "Data Added Successfully"})
        })
    
    })
},


deleteFirstBanner : (adminData) => {
    return new Promise (async (resolve , reject) => {

        await db.get().collection(collection.FIRST_BANNER_DATA).deleteOne({first_banner_heading : adminData.first_banner_heading}).then ( (data) => {
            return resolve ({status : true , shippingId : data.insertedId , successMessage : "Data Deleted Successfully"})
        })
    
    })
},

findFirstBanner : (adminData) => {
    return new Promise (async (resolve , reject) => {

        const firstBanner = await db.get().collection(collection.FIRST_BANNER_DATA).find().toArray()
            return resolve ({status : true , firstBanner })
        })
},

addSecondBanner : (secondBannerData) => {
    return new Promise (async (resolve,reject) => {
        await db.get().collection(collection.SECOND_BANNER_DATA).insertOne(secondBannerData).then ( (response) => {
            return resolve ({status : true ,secondBannerId : response.insertedId , successMessage : "Second Banner Successfully Added"})
        })
    })
} ,

findSecondBanner : (adminData) => {
    return new Promise (async (resolve , reject) => {

        const secondBanner = await db.get().collection(collection.SECOND_BANNER_DATA).find().toArray()
            return resolve ({status : true , secondBanner })
        })
},

deleteSecondBanner : (deleteId) => {
    return new Promise ( async (resolve,reject) => {
        await db.get().collection(collection.SECOND_BANNER_DATA).deleteOne({_id : objectId(deleteId)}).then( (resoponse) => {
            resolve ({status :true , successMessage : "Deleted Successfully"})
        })
    })
},

addAuthorBanner : (authorBannerData) => {
    return new Promise (async (resolve,reject) => {
        await db.get().collection(collection.AUTHOR_BANNER_DATA).insertOne(authorBannerData).then ( (response) => {
            return resolve ({status : true ,authorBannerId : response.insertedId , successMessage : "Second Banner Successfully Added"})
        })
    })
} ,

findAuthorBanner : (adminData) => {
    return new Promise (async (resolve , reject) => {

        const authorBanner = await db.get().collection(collection.AUTHOR_BANNER_DATA).find().toArray()
            return resolve ({status : true , authorBanner })
        })
},

deleteAuthorBanner : (deleteId) => {
    return new Promise ( async (resolve,reject) => {
        await db.get().collection(collection.AUTHOR_BANNER_DATA).deleteOne({_id : objectId(deleteId)}).then( (resoponse) => {
            resolve ({status :true , successMessage : "Deleted Successfully"})
        })
    })
},

addpromotionBanner : (promotionBannerData) => {
    return new Promise (async (resolve,reject) => {
        await db.get().collection(collection.PROMOTION_BANNER_DATA).insertOne(promotionBannerData).then ( (response) => {
            return resolve ({status : true ,promotionBannerId : response.insertedId , successMessage : "Second Banner Successfully Added"})
        })
    })
} ,

findpromotionBanner : (adminData) => {
    return new Promise (async (resolve , reject) => {

        const promotionBanner = await db.get().collection(collection.PROMOTION_BANNER_DATA).find().toArray()
        console.log(promotionBanner[0]._id + " from database id");
            return resolve ({status : true , promotionBanner })
        })
},

deletepromotionBanner : (deleteId) => {
    return new Promise ( async (resolve,reject) => {
        await db.get().collection(collection.PROMOTION_BANNER_DATA).deleteOne({_id : objectId(deleteId)}).then( (resoponse) => {
            resolve ({status :true , successMessage : "Deleted Successfully"})
        })
    })
},

editPromotion : (promotionId , data) => {
    return new Promise (async (resolve , reject) => {

        await db.get().collection(collection.PROMOTION_BANNER_DATA).updateOne({_id:objectId(promotionId)} , {
            $set: {
                first_promotion_heading : data.first_promotion_heading ,
                first_promotion_body : data.first_promotion_body ,
                second_promotion_heading : data.second_promotion_heading ,
                second_promotion_body : data.second_promotion_body 
            }
        }).then((response) => {
            resolve({status : true , response , successMessage : "Edited Successfully"})
        })
            
        })
       
} ,

viewPromotion : (promotionId) => {
    return new Promise (async (resolve,reject) => {
        const promotionBanner = await db.get().collection(collection.PROMOTION_BANNER_DATA).findOne({_id : objectId(promotionId)})
        resolve({status : true , promotionBanner})
    }) 
},

addpromotionLast : (lastpromotionBannerData) => {
    return new Promise (async (resolve,reject) => {
        await db.get().collection(collection.LAST_PROMOTION_BANNER_DATA).insertOne(lastpromotionBannerData).then ( (response) => {
            return resolve ({status : true ,lastpromotionBannerId : response.insertedId , successMessage : "Second Banner Successfully Added"})
        })
    })
} ,

findpromotionLast : (adminData) => {
    return new Promise (async (resolve , reject) => {

        const lastpromotionBanner = await db.get().collection(collection.LAST_PROMOTION_BANNER_DATA).find().toArray()
            return resolve ({status : true , lastpromotionBanner })
        })
},

deleteLastpromotionBanner : (deleteId) => {
    return new Promise ( async (resolve,reject) => {
        await db.get().collection(collection.LAST_PROMOTION_BANNER_DATA).deleteOne({_id : objectId(deleteId)}).then( (resoponse) => {
            resolve ({status :true , successMessage : "Deleted Successfully"})
        })
    })
},

editLastPromotion : (promotionId , data) => {
    return new Promise (async (resolve , reject) => {

        await db.get().collection(collection.LAST_PROMOTION_BANNER_DATA).updateOne({_id:objectId(promotionId)} , {
            $set: {
                last_promotion_first_line : data.last_promotion_first_line ,
                last_promotion_second_line : data.last_promotion_second_line 
            }
        }).then((response) => {
            resolve({status : true , response , successMessage : "Edited Successfully"})
        })
            
        })
       
} ,

viewLastPromotion : (lastpromotionId) => {
    return new Promise (async (resolve,reject) => {
        const lastpromotionBanner = await db.get().collection(collection.LAST_PROMOTION_BANNER_DATA).findOne({_id : objectId(lastpromotionId)})
        resolve({status : true , lastpromotionBanner})
    }) 
} ,

findCouponBanner : (adminData) => {
    return new Promise (async (resolve , reject) => {

        const couponBanner = await db.get().collection(collection.COUPON_BANNER_DATA).find().toArray()
            return resolve ({status : true , couponBanner })
        })
},

addCouponBanner : (adminData) => {
    return new Promise (async (resolve , reject) => {

        await db.get().collection(collection.COUPON_BANNER_DATA).insertOne(adminData).then ( (data) => {
            return resolve ({status : true , shippingId : data.insertedId , successMessage : "Data Added Successfully"})
        })
    
    })
},


deleteCouponBanner : (deleteId) => {
    return new Promise (async (resolve , reject) => {

        await db.get().collection(collection.COUPON_BANNER_DATA).deleteOne({_id : objectId(deleteId)}).then ( (data) => {
            return resolve ({status : true , successMessage : "Data Deleted Successfully"})
        })
    
    })
},

addAddress : (user_address , userId) => {
    return new Promise (async (resolve,reject) => {

        user_address.id = objectId()
        
        let address = {
            user_id : objectId(userId) ,
            addresses : [user_address]
        }

        const userAddress = await db.get().collection(collection.USER_ADDRESS_DATA).findOne({user_id : objectId(userId)})

        if (userAddress) {  
            await db.get().collection(collection.USER_ADDRESS_DATA).updateOne({user_id : objectId(userId)} ,
            {$push : 
            {
                addresses : user_address
            }
        }).then( (response) => {
            resolve( { status : true , addressId : response.insertedId , successMessage : "Address added successfully"})
        })
        
        }

        else {
            await db.get().collection(collection.USER_ADDRESS_DATA).insertOne(address).then( (response) => {
                resolve ({status : true , addressId : response.insertedId , successMessage : "Address added successfully"})
          
        })
    }
        
    })

} ,

getUserAddress : ( userId) => {

    return new Promise( async (resolve , reject) => {
        let oneAddress =  await db.get().collection(collection.USER_ADDRESS_DATA).findOne({user_id : objectId(userId)})
        if (oneAddress) {
            resolve(oneAddress.addresses)
        }
        else {
            resolve()
        }
 
        
       

    })
},

deleteAddress : (userId , addressId) => {
    return new Promise (async (resolve , reject) => {
        await db.get().collection(collection.USER_ADDRESS_DATA).updateOne(
            {
            user_id : objectId(userId)
        },
        {
            $pull : { addresses : {id : objectId(addressId)} }
        }
        )
        resolve()
    })
},

editAddress : (  userId , data ) => {
    console.log(userId , data, "editAddress from db");
    return new Promise (async (resolve , reject) => {
        await db.get().collection(collection.USER_ADDRESS_DATA).updateOne(
            {
                user_id : objectId(userId) , "addresses.id" : objectId(data.AddressId)
            },
            {
                $set : {
                    "addresses.$.user_name" : data.user_name ,
                    "addresses.$.user_email" : data.user_email ,
                    "addresses.$.user_number" : data.user_number ,
                    "addresses.$.State" : data.State ,
                    "addresses.$.City" : data.City ,
                    "addresses.$.user_address" : data.user_address ,
                    "addresses.$.user_town" : data.user_town ,
                    "addresses.$.user_zip_code" : data.user_zip_code 
                    
                }
            }
        )
        resolve({successMessage : "Address Edited Successfully"})
    })
},



getOneAddress: (addressId, userId) => {

    console.log(addressId , userId , "from db Ids");

    return new Promise(async (resolve, reject) => {
        let address = await db.get().collection(collection.USER_ADDRESS_DATA).aggregate([
            {
                $match: { user_id : objectId(userId) }
            }
            ,
            {
                $unwind: "$addresses"
            }
            ,
            {
                $match: { "addresses.id": objectId(addressId) }
            }

        ]
        ).toArray()

        console.log(address , "from database address");

        let result = address[0].addresses
        resolve(result)

    })

},



changePaymentStatusByUser : (userId , id) => {
    return new Promise( async (resolve,reject) => {
        orderCancel = await db.get().collection(collection.ORDER_COLLECTION)
        
        
       
        .updateOne({_id : objectId(id)} ,
        {$set : {
            status : "Cancelled" ,
            isActive : false
        }
    })
    resolve({successMessage : "Order Cancelled Successfully"})
    })
},

getCheckoutAddress : ( userId,addressId) => {
    return new Promise( async (resolve , reject) => {
        let oneAddress =  await db.get().collection(collection.USER_ADDRESS_DATA).aggregate([
            {
                $match : {
                    user_id : objectId(userId)
                }
            },
            {
                $unwind :"$addresses"
            },
            {
                $match : {
                    "addresses.id" : objectId(addressId)
                }
            }
        ]).toArray()
        let address = oneAddress[0].addresses
        resolve(address)

    })
},

userOrderDetails : (userId) => {
  
    return new Promise (async (resolve , reject) => {
        const order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {$match : {
                bookId : objectId(userId)
            }
         },
         {
             $unwind : "$book"
         },
         
         
    ]).toArray()
    
        resolve(order)
    })
} ,

updateUserData : (UserId , userData) => {
    return new Promise (async (resolve,reject) => {
        await db.get().collection(collection.USER_COLLECTION).updateOne({_id : objectId (UserId)} ,
        {$set : {
            user_name : userData.user_name ,
            user_email : userData.user_email ,
            user_number : userData.user_number ,
            user_dob : userData.user_dob ,
            user_state : userData.user_state ,
            user_gender : userData.user_gender 

        }})
        resolve({successMessage : "Profile Updated Successfully"})
    })
},

generateRazorpay : (orderId , totalRate) => {
    return new Promise (async (resolve,reject) => {


        instance.orders.create({
            amount: totalRate * 100,
            currency: "INR",
            receipt: "" + orderId,
            notes: {
              key1: "value3",
              key2: "value2"
            }
          } ,
          (err , order) => {
              if(err){
                  console.log(err);
              }
              else{
                  resolve(order)
              }
          })

    })
},


verifyPayment : (data) => {
    console.log(data , " data from verify payment");
    return new Promise( (resolve,reject)=> {

        let crypto = require("crypto");
        let hmac = crypto.createHmac('sha256', '5FA8kbS3sETAUJvRNOoXXo7X');

        hmac.update(data['payment[razorpay_order_id]'] + '|' + data['payment[razorpay_payment_id]'])
        hmac = hmac.digest("hex"); 
        console.log("payment success 1");
        if (hmac == data['payment[razorpay_signature]']) {
            console.log("payment success 2");
            resolve()
        }
        else {
            console.log("payment rejected");
            reject()
        }


 
    })
},

changePaymentStatus : (orderId) => {
    return new Promise( (resolve,reject) => {
        db.get().collection(collection.ORDER_COLLECTION)
        .updateOne(
            {_id : objectId (orderId)}, 
        {
            $set : {
                status : 'Placed' ,
                isActive : true
            }
        }).then( (response) => {
            resolve ()
        })
    })
},

destroyCart : (userId) => {
    return new Promise ( (resolve,reject) => {
        db.get().collection(collection.CART_COLLECTION).deleteOne({user : objectId(userId)})
        resolve({ status : true})
    })
    
},

adminDP : (admindp) => {
    return new Promise (async (resolve,reject) => {
        await db.get().collection(collection.ADMIN_DP_COLLECTION).insertOne(admindp).then( (response)=> {
            resolve({id : response.insertedId});
        })
        
    })
},
findDP : () => {

    return new Promise ( async (resolve,reject) => {
        dpData = await db.get().collection(collection.ADMIN_DP_COLLECTION).find().toArray()
        resolve(dpData)
    })
},

addSubscriptionPlans : (data) => {
    return new Promise (async (resolve,reject) => {
        db.get().collection(collection.SUBSCRIPTION_PLANS).insertOne(data)
        resolve({status : true , successMessage : "New Plan Added Successfully"})
    })
},

findPlans : () =>{
    return new Promise (async (resolve,reject) =>{
        const subscription = db.get().collection(collection.SUBSCRIPTION_PLANS).find().toArray()
        resolve(subscription)
    })
},

deletePlan : (id) => {
    return new Promise (async (resolve,reject) => {
        db.get().collection(collection.SUBSCRIPTION_PLANS).deleteOne({_id : objectId(id)})
        resolve({successMessage : "SUBSCRIPTION PLAN Deleted Successfully"})
    })
},

findOnePlanForCheckout : (data) =>{
    return new Promise (async (resolve,reject) =>{
        const subscription_rate = await db.get().collection(collection.SUBSCRIPTION_PLANS)
        .findOne({_id : objectId(data.PlanId) },
        {
            $or : [
                {monthlyRate : data.subscription_rate},
                {yearlyRate : data.subscription_rate}
            ]
        }
        )
        resolve(subscription_rate)
    })
},



getUser : (UserId) => {
    return new Promise ( async(resolve,reject) => {
        const user = await db.get().collection(collection.USER_COLLECTION).findOne({_id : objectId(UserId)})

        resolve(user)
    })
},

checkOut : (data , plan ,  userOriginalId,  order,oneBook,totalRate , shiprate , bookId) => {



    return new Promise( async (resolve , reject) => {

        
        let status = data.payment === 'COD'? 'Placed' : 'Pending'

        let orderObj = {
            deliveryDetails : {
                name : order.user_name ,
                email : order.user_email ,
                number : order.user_number ,
                address : order.user_address ,
                state : order.State ,
                city : order.City ,          
                town : order.user_town ,
                pinCode : order.user_zip_code 
            },
            userId : objectId(order.userId) ,
            userOriginalId : objectId(userOriginalId) ,
            payment : data.payment ,
            totalAmount : totalRate ,
            ship_rate : shiprate ,
            book : oneBook ,
            bookId : bookId ,
            date : new Date() ,
            status : status ,
            isActive : true ,
            plan : plan

        }
        
        db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then( (response) => {

        resolve({id : response.insertedId })
        })
    
   
    })
    
} ,

checkOut_subscription : (userId , data  , rate , plan , validity , state) => {
    return new Promise ( async (resolve,reject) => {
        
        let Oneplan = await db.get().collection(collection.SUBSCRIPTION_PLANS).findOne({ planTitle : plan})
        let maxCountBooks = Oneplan.bookCount


        await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .createIndex( { "endingAt": 1 }, { expireAfterSeconds: 0 } )

        let receiptObj = {
            userId : objectId(userId) ,
            amount : parseInt(rate) ,
            validity : validity ,
            plan   : plan ,
            maxCountBooks : parseInt(maxCountBooks) ,
            state : state ,
            status : 'Pending',
            isActive : true ,
            createdAt : new Date() ,
            endingAt : new Date()
        }

            
        await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION).insertOne(receiptObj).then( (response) => {            
            const id = response.insertedId
            resolve(id)
        }) 

        
    

    })
},

generateRazorPayForPlan : (orderId , amount) => {
    return new Promise( async(resolve,reject) => {
        
        instance.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: "" + orderId,
            notes: {
              key1: "value3",
              key2: "value2"
            } 
        },
            (err , order) => {
                if(err){
                    console.log("this is error");
                    console.log(err);
                }
                else{
                    resolve(order)
                }
            })
  
      })
  },


verifyPaymentSubscription : (data) => {

    return new Promise( (resolve,reject)=> {

        let crypto = require("crypto");
        let hmac = crypto.createHmac('sha256', '5FA8kbS3sETAUJvRNOoXXo7X');

        hmac.update(data['payment[razorpay_order_id]'] + '|' + data['payment[razorpay_payment_id]'])
        hmac = hmac.digest("hex"); 
        if (hmac == data['payment[razorpay_signature]']) {
            resolve()
        }
        else {
            console.log("payment rejected");
            reject()
        }


 
    })
} ,

changePaymentStatusForSubscription : (orderId , id) => {
    return new Promise( async(resolve,reject) => {

    
        const paid_plan = await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .find({ userId : objectId(id) }).toArray()


        console.log(paid_plan[paid_plan.length-2] , "from database");

        const final_paid_plan = paid_plan[paid_plan.length-2]


        if (paid_plan.length == 1) {

        await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .findOne({_id : objectId(orderId) , userId : objectId(id) })
        .then(async (response) => {
            
            if (response.validity == "month") {
                let future = new Date();
                let date = future.setDate(future.getDate() + 28);

        await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .updateOne({_id : objectId(orderId) , userId : objectId(id)} , 
        {
            $set : {
                createdAt : new Date() ,
                endingAt : new Date(date) ,
                status : "Success" ,
                isActive : true
                
            }
        }) 

        const subscription = await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .findOne({_id : objectId(orderId) , userId : objectId(id) })

        await db.get().collection(collection.TOTAL_SUBSCRIPTION_PAID_COLLECTION)
        .insertOne(subscription) 

        resolve()
            } 

            if (response.validity == "year") {
                let future = new Date();
                let date = future.setDate(future.getDate() + 365);

        await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .updateOne({_id : objectId(orderId) , userId : objectId(id) } , 
        {
            $set : {
                createdAt : new Date() ,
                endingAt : new Date(date) ,
                status : "Success" ,
                isActive : true
            }
        }) 

        const subscription = await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .findOne({_id : objectId(orderId) , userId : objectId(id) })

        await db.get().collection(collection.TOTAL_SUBSCRIPTION_PAID_COLLECTION)
        .insertOne(subscription) 

        // await db.get().collection(collection.TOTAL_SUBSCRIPTION_PAID_COLLECTION)
        // .updateOne({_id : objectId(orderId) , userId : objectId(id) } ,
        // {
        //     $unset : {
        //         endingAt
        //     }
        // }) 


        resolve()
            }

            else {
                resolve({errorMessage : "Failed"})
            }


        }) 
    } 

    else {


   
        const oneid = final_paid_plan._id

        const specified_plan = await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .findOne({_id : objectId(oneid) , userId : objectId(id)})

        const removeDate = specified_plan.endingAt

        await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .findOne({_id : objectId(orderId) , userId : objectId(id)})
        .then(async (response) => {

            // console.log(response , "response from databse line number 1176");
            
            if (response.validity == "month") {
                let future = new Date(removeDate);
                let date = future.setDate(future.getDate() + 28);

        await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .updateOne({_id : objectId(orderId) , userId : objectId(id)} , 
        {
            $set : {
                createdAt : new Date(removeDate) ,
                endingAt : new Date(date) ,
                status : "Success" ,
                isActive : true
                
            }
        }) 

        const subscription = await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .findOne({_id : objectId(orderId) , userId : objectId(id) })

        await db.get().collection(collection.TOTAL_SUBSCRIPTION_PAID_COLLECTION)
        .insertOne(subscription) 

        resolve()
            } 

            if (response.validity == "year") {
                let future = new Date(removeDate);
                let date = future.setDate(future.getDate() + 365);

        await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .updateOne({_id : objectId(orderId) , userId : objectId(id)} , 
        {
            $set : {
                createdAt : new Date(removeDate) ,
                endingAt : new Date(date) ,
                status : "Success" ,
                isActive : true
            }
        }) 

        const subscription = await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .findOne({_id : objectId(orderId) , userId : objectId(id) })

        await db.get().collection(collection.TOTAL_SUBSCRIPTION_PAID_COLLECTION)
        .insertOne(subscription) 



        resolve()
            }

            else {
                resolve({errorMessage : "Failed"})
            }


        }) 
    }
 
        
    })
},

addCoupon : (Data) => {
    return new Promise (async (resolve,reject) => {
        console.log(Data.validity , "from db");
        await db.get().collection(collection.COUPON_COLLECTION)
        .createIndex( { "validity": 1 }, { expireAfterSeconds: 0 } )
         
         let date = new Date(Data.validity)
        
        await db.get().collection(collection.COUPON_COLLECTION).insertOne({
            coupon_code : Data.coupon_code ,
            plan : Data.plan ,
            validity : date ,
            off_percentage : Data.off_percentage
            
        }).then( (response)=> {
                resolve({id : response.insertedId , successMessage : "Coupon Added Successfully"});
            
        })
        
    })
},

findCoupon : () => {

    return new Promise ( async (resolve,reject) => {
        findCoupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
        resolve(findCoupon)
    })
} , 

findOnePlan : (id) => {

    return new Promise ( async (resolve,reject) => {
        const findOnePlan = await db.get().collection(collection.SUBSCRIPTION_PLANS)
        .findOne({_id : objectId(id)})
        resolve(findOnePlan)
    })
} ,

deleteOneCoupon : (id) => {

    return new Promise ( async (resolve,reject) => {
        await db.get().collection(collection.COUPON_COLLECTION)
        .deleteOne({_id : objectId(id)})
        resolve({successMessage : "Offer Coupon Deleted Successfully"})
    })
} ,

findCouponUsingCode : (data) => {
    
    return new Promise ( async (resolve,reject) => {
        const coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({$text:{$search: data}})
        if (coupon) {
            resolve({coupon: coupon,status : true})
        }
        else {
            resolve({status : false})
        }
        
    })
} ,

viewProductUsingRegex : (content) => {
    return new Promise (async (resolve , reject) => {

        const book = await db.get().collection(collection.ADMIN_BOOK_COLLECTION).aggregate([
            {
                $match : {
                    $or : [
                        {
                        'book_name' : {
                            $regex : content ,
                            $options : 'i'
                        }
                    } ,
                    {
                        'book_author' : {
                            $regex : content ,
                            $options : 'i'
                        }
                    } ,
                    {
                        'book_category' : {
                            $regex : content ,
                            $options : 'i'
                        }
                    } ,
                    {
                        'book_sub_category' : {
                            $regex : content ,
                            $options : 'i'
                        }
                    }
                ]

            }
        } 
            
    ]).toArray()

    resolve(book)
        
    })
       
}, 

getAllUsers : () => {
    return new Promise ( async(resolve,reject) => {
        const user = await db.get().collection(collection.USER_COLLECTION).find().toArray()

        resolve(user)
    })
},

updatePlanForUser : (id , userId) => {

    return new Promise ( async (resolve,reject) => {

        await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .findOne({_id : objectId(id)}).then(async (response) => {
            await db.get().collection(collection.USER_COLLECTION)
            .updateOne(
                {
                _id : objectId(userId)
            } ,
            {
                $set : {
                    plan : response.plan,
                    validity : response.validity,
                    subscription_amount : parseInt(response.amount),
                    isActivePlan : true
                }
            }
        )
        resolve()
    })
  }) 
} ,

disableUser : (id) => {
    return new Promise ( async(resolve,reject) => {
        await db.get().collection(collection.USER_COLLECTION)
        .updateOne(
            {
                _id : objectId(id)
            } ,
            {
                $set : {
                    isActive : false
                }
            }
        )

        resolve()
    })
},

enableUser : (id) => {
    return new Promise ( async(resolve,reject) => {
        await db.get().collection(collection.USER_COLLECTION)
        .updateOne(
            {
                _id : objectId(id)
            } ,
            {
                $set : {
                    isActive : true
                }
            }
        )

        resolve()
    })
},

disablePlan : (id) => {
    return new Promise ( async(resolve,reject) => {
        await db.get().collection(collection.USER_COLLECTION)
        .updateOne(
            {
                _id : objectId(id)
            } ,
            {
                $set : {
                    isActivePlan : false
                }
            }
        )

        resolve()
    })
},

enablePlan : (id) => {
    return new Promise ( async(resolve,reject) => {
        await db.get().collection(collection.USER_COLLECTION)
        .updateOne(
            {
                _id : objectId(id)
            } ,
            {
                $set : {
                    isActivePlan : true
                }
            }
        )

        resolve()
    })
},

findAllOrderDetails : () => {
  
    return new Promise (async (resolve , reject) => {
        const order = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
    
        resolve(order)
    })
} ,

cancelOrdrByAdmin : (userId , orderId) => {

    return new Promise( async (resolve,reject) => {
        await db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({ userOriginalId : objectId(userId) ,  _id : objectId(orderId) } ,
        {$set : {
            status : "Cancelled" 
            
        }
    })
    resolve({successMessage : "Order Cancelled Successfully"})
    })
},

packedOrdrByAdmin : async (userId , orderId) => {

    

    return new Promise( async (resolve,reject) => {
        await db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({ userOriginalId : objectId(userId) , _id : objectId(orderId) } ,
        {$set : {
            status : "Packed" 
                        
        }
    })
        
    resolve({successMessage : "Order Packed Successfully"})
    })
},

shippedOrdrByAdmin : async (userId , orderId) => {


    return new Promise( async (resolve,reject) => {
        await db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({ userOriginalId : objectId(userId) , _id : objectId(orderId)} ,
        {$set : {
            status : "Shipped" 
            
        }
    })
    resolve({successMessage : "Order Shipped Successfully"})
    })
},

deliveredOrdrByAdmin : async (userId , orderId) => {


    const order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {$match : {
            userOriginalId : objectId(userId) ,
            _id : objectId(orderId)
        }
     },
     {
         $unwind : "$book"
     }
     
     
]).toArray()


    return new Promise( async (resolve,reject) => {
        await db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({ userOriginalId : objectId(userId) , _id : objectId(orderId) } , 
        {$set : {
            status : "Delivered" 
            
        }
    })

    await db.get().collection(collection.ADMIN_BOOK_COLLECTION).updateOne({ book_name : order[0].book.book_name } ,
            
        { 
            $inc: 
            { 
                no_of_rented_books : 1
        }
    }
        )

    resolve({successMessage : "Order Delivered Successfully"})
    })
},

findAllPlans : () => {
    return new Promise (async (resolve , response) => {
        const plans = await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION).find().toArray()
            resolve(plans)
        }) 
} ,



findTotalAmountAndCount : () => {
    return new Promise (async (resolve , response) => {
        const countt = await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .aggregate([
            {
                $group : 
                {
                    _id : "$state" ,
                    count : {
                        "$count" : {}
                    },
                    sum : {
                        $sum :  "$amount"  
                    }
                }
            } 
        ]).toArray()
        
            resolve(countt)
        }) 
} ,

getdatesalesreport:(start,end)=>{
    return new Promise(async(resolve,reject)=>{
        let report=await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION).aggregate([
            {
                $match:{createdAt:{$gte:new Date(start),$lt:new Date(end)}}
            },
            {
                $group : 
                {
                    _id : "$state" ,
                    count : {
                        "$count" : {}
                    },
                    sum : {
                        $sum :  "$amount"  
                    }
                }
            },
            {
                $sort:{date:-1}
            }             
        ]).toArray()   
        resolve(report)
    })
},

getdatestockesreport : (start,end) => {
    return new Promise (async (resolve , reject) => {

        const book = await db.get().collection(collection.ADMIN_BOOK_COLLECTION).aggregate([
            {
                $match:{book_added_date:{$gte:new Date(start),$lt:new Date(end)}}
            },
            {
                $sort:{date:-1}
            }             
        ]).toArray()   
        resolve(book)
    })
},


findFirstUserPlans : (userId) => {

    return new Promise (async (resolve , response) => {
        const specified_plan = await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .findOne({ userId : objectId(userId) })
            resolve(specified_plan)
        }) 
} ,

findUserPlans : (userId) => {
    return new Promise (async (resolve , response) => {
        const specified_plan = await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
        .find({ userId : objectId(userId) }).toArray()
            resolve(specified_plan)
        }) 
} ,

rentedCountFromOrder : (id) => {
  
    return new Promise (async (resolve , reject) => {
        const order = await db.get().collection(collection.ORDER_COLLECTION)
        .find({ userOriginalId : objectId(id)}).toArray()
    
        resolve(order)
    })
} ,

alluserOrderDetails : () => {
  
    return new Promise (async (resolve , reject) => {
        const order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {$match : {
               
            }
         },
         {
             $unwind : "$book"
         },
         
         
    ]).toArray()
  
           resolve(order)
    })
} ,

returnOrdrByUser : async ( booId , useId ) => {
    let bookArray
    let order
    return new Promise ( async (resolve , reject) => {


    let paidPlan = await db.get().collection(collection.SUBSCRIPTION_PAID_COLLECTION)
    .findOne({ userId : objectId(useId)})

    const planEndDate = paidPlan.endingAt 


    const returnDate = new Date()
    let userId = objectId(useId)
    let bookId = objectId(booId)

    let obj = {
        userId , planEndDate , returnDate , bookId
    }

  
    await db.get().collection(collection.RETURN_BOOK).insertOne(obj) 

    
    await db.get().collection(collection.ORDER_COLLECTION)
    .findOne({ userOriginalId : objectId(useId)})
    .then (async (response) => {
        let responseArray = response.book
        bookArray = responseArray.map( (elem) => {
            if (elem._id == booId){
                elem.status = "Return"
            }
            return elem;
        })
        await db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({ userOriginalId : objectId(useId) },
        {
            $set : 
            {
                book : bookArray
            }
        });
       

    
        order = await db.get().collection(collection.ORDER_COLLECTION)
        .findOne({
            "book._id" : objectId(booId)
        })

        let responseBook = order.book
        let book = responseBook.filter( (elem) => {
            if (elem._id == booId){
                return elem 
            }
           
            
        })
 

    resolve({order , book});
})         
    
})  

} ,

returnBooks : async (data  , useId , booId , date , plan , id , fine) => {

    return new Promise ( async (resolve , reject) => {

        await db.get().collection(collection.RETURN_BOOK).updateOne({ userId : useId ,  bookId : booId} ,
            {
                $set : {
                    status : "Rent" ,
                    ordered : date ,
                    plan : plan ,
                    fineAmountForOneDay : fine
                }
                
            })       

        resolve()   
    })
} ,

findReturnBook : (bookId) => {
    return new Promise ( async (resolve , reject) => {
        let returnBook = await db.get().collection(collection.RETURN_BOOK)
        .find( {userId : objectId(bookId) , status : "Return"}).toArray()

        resolve(returnBook)
    })
} ,

findAllReturnBook : () => {
    return new Promise ( async (resolve , reject) => {
        let returnBook = await db.get().collection(collection.RETURN_BOOK).find().toArray()
        resolve(returnBook)
    })
} ,

findMatchedReturnBook : (id) => {
    return new Promise ( async (resolve , reject) => {
        let returnBook = await db.get().collection(collection.RETURN_BOOK)
        .find({userId : objectId(id)}).toArray()
        resolve(returnBook)
    })
} ,

deleteReturnBookFromOrder : (userId , bookId) => {
    return new Promise(async (resolve,reject) => {



        db.get().collection(collection.ORDER_COLLECTION).updateOne(
            {
                userOriginalId : objectId(userId)
        },
        {
            $pull : {
                book : 
                {
                    _id : objectId(bookId)
                }
                    
            }
        }
    )

    let order = await db.get().collection(collection.ORDER_COLLECTION)
    .findOne({ userOriginalId : objectId(userId) })

    if ( !order.book[0]) {
        await db.get().collection(collection.ORDER_COLLECTION)
    .deleteOne({ userOriginalId : objectId(userId) })
    }
    resolve()
    })
    
},

deleteReturnBookFromReturn : (userId , bookId) => {
    return new Promise(async (resolve,reject) => {

        db.get().collection(collection.RETURN_BOOK).deleteOne(
            {
                userId : objectId(userId) ,
                bookId : objectId(bookId)             
        } 
    )
    resolve()
    })
    
},

updatePremiumFineInBook : (fine) => {
 
    return new Promise(async (resolve,reject) => {

        db.get().collection(collection.ADMIN_BOOK_COLLECTION).updateMany(
            {
                book_checkPremium : "Premium"         
        } ,
        {
            $set : 
            {
                fine
            }
        }
    )
    resolve({successMessage : "Fine Amount Updated Successfully"})
    })
    
},

updateNonPremiumFineInBook : (fine) => {

    return new Promise(async (resolve,reject) => {

        db.get().collection(collection.ADMIN_BOOK_COLLECTION).updateMany(
            {
                book_checkPremium : 
                {
                    $ne : "Premium"  
                }
                       
        } ,
        {
            $set : 
            {
                fine
            }
        }
    )
    resolve({successMessage : "Fine Amount Updated Successfully"})
    })
    
},

reduceRentCoutAfterReturn : (userId , bookId) => {

    return new Promise( async (resolve,reject) => {

        const order = await db.get().collection(collection.ORDER_COLLECTION)
        .findOne({ userOriginalId : objectId(userId) , _id : objectId(orderId) , status : "Delivered" })

        if (order) {

    await db.get().collection(collection.ADMIN_BOOK_COLLECTION).updateOne( { _id : objectId (bookId) } ,
        
        { 
            $inc: 
            { 
                no_of_rented_books : -1
        }
    }
        )
        resolve({successMessage : "Return Conformed Successfully"})

}

   
    })
},

updateReturnBooks : (userId , bookId , fineAmount) => {
    return new Promise(async (resolve,reject) => {

        let fine = await db.get().collection(collection.RETURN_BOOK).findOne({
            userId : objectId(userId) ,
                bookId : objectId(bookId)   
        })

        if (fine) {

        let fineUsers = await db.get().collection(collection.FINE_AMOUNT_USERS)
        .findOne({
            userId : objectId(userId) ,
                bookId : objectId(bookId)
        })

        if (fineUsers) {
            await db.get().collection(collection.FINE_AMOUNT_USERS).updateOne({
                userId : objectId(userId) ,
                bookId : objectId(bookId) 
            } ,
            {$set :
            {   fineAmount : fineAmount ,
                fine ,
                msgSendDate : new Date()
            }
        })

        }
        else {
            await db.get().collection(collection.FINE_AMOUNT_USERS).insertOne(
                {
                    userId : objectId(userId) ,
                    bookId : objectId(bookId) ,
                    fineAmount : fineAmount ,
                    fine  ,
                    msgSendDate : new Date()          
            } 
        )
        }

        
    resolve()
    } 
    else {
        resolve({errorMessage : "No Books Were Returned"})
    }
}) 
    
},

findFineAmount : (id) => {
    return new Promise ( async (resolve , reject) => {
        const fineUser = await db.get().collection(collection.FINE_AMOUNT_USERS).find({
            userId : objectId(id)
        }).toArray()
        resolve(fineUser)
    })
} , 


findTotalAmountPerMonth : () => {
    return new Promise (async (resolve , response) => {
        let countt = await db.get().collection(collection.TOTAL_SUBSCRIPTION_PAID_COLLECTION)
        .aggregate([

            {
                                $group : 
                                {
                                    _id: { $month: "$createdAt" },
                                    count : {
                                        "$count" : {}
                                    },
                                    sum : {
                                        $sum :  "$amount"  
                                    } 
                                } 
                              
                            } 
            
        ]).sort({_id:1}).toArray()
            let obj ={}
            let arr = []
        for(let i =1;i<=12;i++){
            obj[i] = 0
        }
        for(const x of countt){
            obj[x._id] = x.sum

        }
        for(let x in obj){
            arr.push(obj[x])
        }
            resolve(arr)  
        }) 
} ,

findTotalPaidSubscription : () => {
    return new Promise ( async (resolve , reject) => {
        const totalSubscription = await db.get().collection(collection.TOTAL_SUBSCRIPTION_PAID_COLLECTION).find().toArray()
        resolve(totalSubscription)
    })
} , 

userDataUsingState : () => {
    return new Promise ( async (resolve , reject) => {
        let state = [] 
        let countOfState = [] 
        let sumOfSubscription = []
        let temp

        const userState = await db.get().collection(collection.TOTAL_SUBSCRIPTION_PAID_COLLECTION).
        aggregate([
            {
                $group : 
                {
                    _id : "$state" ,
                    count: { $count: { }
                 } ,
                 
                    sum : 
                    {
                        $sum : "$amount"
                    }
                

                } 
                
            } 
            
        ]).sort({count : -1}).toArray()

        for ( let i = 0; i < userState.length; i++) {
            temp = userState[i]._id
            state.push(temp) 
            temp = userState[i].count
            countOfState.push(temp)
            temp = userState[i].sum
            sumOfSubscription.push(temp)
        }

        if (userState && state && countOfState && sumOfSubscription) {
            resolve({userState , state , countOfState , sumOfSubscription});
        }
        
        
    })
} ,
 
// userDataUsingState : () => {
//     return new Promise ( async (resolve , reject) => {
//         let state = [] 
//         let countOfState = [] 
//         let sumOfSubscription = []
//         let temp

//         const userState = await db.get().collection(collection.USER_COLLECTION).
//         aggregate([
//             {
//                 $group : 
//                 {
//                     _id : "$user_state" ,
//                     count: { $count: { }
//                  } ,
                 
//                     sum : 
//                     {
//                         $sum : "$subscription_amount"
//                     }
                

//                 } 
                
//             } 
            
//         ]).sort({count : -1}).toArray()

//         for ( let i = 0; i < userState.length; i++) {
//             temp = userState[i]._id
//             state.push(temp) 
//             temp = userState[i].count
//             countOfState.push(temp)
//             temp = userState[i].sum
//             sumOfSubscription.push(temp)
//         }

//         if (userState && state && countOfState && sumOfSubscription) {
//             resolve({userState , state , countOfState , sumOfSubscription});
//         }
        
        
//     })
// } ,

addCouponUser : (userId , coup) => {
    return new Promise ( async (resolve , reject) => {

        if (coup) {
            await db.get().collection(collection.USER_COLLECTION)
        .updateOne({_id : objectId (userId)} ,
            {
                $push :
                {
                    coupon : coup
                } 
            }
            )
        }
        
        resolve()
    })
} ,

findCouponinUser : (userId , couponCod) => {
    console.log(userId , couponCod , "from database");
    return new Promise ( async (resolve , reject) => {
        const coupon = await db.get().collection(collection.USER_COLLECTION)
        .findOne({ _id : objectId(userId) , coupon : couponCod })
        if (coupon) {
            resolve (couponCod)
        }else {
            resolve()
        }
    })
}



}
