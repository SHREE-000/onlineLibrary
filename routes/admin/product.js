const { response } = require('express')
const express = require ('express')
const { Db } = require('mongodb')
const { post } = require('..')
const router = express.Router()
const adminCategoryHelpers = require ('../../helpers/admin_product')

const verifyLogin = ( (req,res,next) =>{

    if(req.session.admin) {
        let admin = req.session.admin
      next()
    }
    else {
      res.redirect('/a-login')
    }
  })

// add , find , delete category

router.get ('/',verifyLogin , async (req , res) => {

    let findCategory = await adminCategoryHelpers.findCategory() 
    let category = findCategory.category

    console.log(category , "idfhrgg");

    const errorMessage = req.session.errorMessage
    req.session.errorMessage = null
    const successMessage = req.session.successMessage
    req.session.successMessage = null
    
    res.render ('admin/category' , {errorMessage , successMessage , category})
})

router.post ('/', (req , res) => {

    adminCategoryHelpers.doAdminCategory(req.session.admin._id , req.body).then( (response) => {

        if (response.status) {

        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage
        res.redirect('/a-product')
        }
})   
})

router.post('/delete-category',async (req,res) => {
    await adminCategoryHelpers.deleteCategory(req.body.book_category).then( (response) => {
        req.session.errorMessage = response.errorMessage
        res.redirect('/a-product')
    })
  })
  
  // add , find , delete sub-category

router.get ('/sub-category', verifyLogin , async (req , res) => {

 

    let findCategory = await adminCategoryHelpers.findCategory() 
    let category = findCategory.category

    let book_category = category.category
    let book_sub_category = category.book_sub_category

    let total_category = {
        book_category ,
        book_sub_category 
    }

    console.log(total_category , "from sub-category router");

    const errorMessage = req.session.errorMessage
    req.session.errorMessage = null
    const successMessage = req.session.successMessage
    req.session.successMessage = null
    
    res.render ('admin/sub-category' , {errorMessage , successMessage , category , total_category})
})

router.post ('/sub-category', (req , res) => {

    console.log(req.body , " req.body from sub-category post method router");

    adminCategoryHelpers.doAdminSubCategory(req.body).then( (response) => {

        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage

        res.redirect ('/a-product/sub-category')   
})

})

router.post ('/delete-sub-category', async(req , res) => {

    await adminCategoryHelpers.deleteSubCategory(req.body).then( (response) => {

        if (response.status) {

        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage

        res.redirect ('/a-product/sub-category')
        

        }
})

})

// view book deatails 

router.get ('/product-view', verifyLogin , (req , res) => {
    adminCategoryHelpers.getAllProduct(req.body).then( (response) => {
        const book = response.book
        res.render ('admin/product-view' , {book})
    })
})

// add new book and details

router.get('/add-product' , verifyLogin ,  async (req , res) => {

    const categorry = await adminCategoryHelpers.findCategory()

    const category = categorry.category
        res.render ('admin/add-product' , {  category})
    
})

router.post('/add-product', (req ,res) => {

    adminCategoryHelpers.adminAddProduct(req.body , req.params.id).then((response) => {
      
        const id  = response.productId

        const image1 = req.files.image1
        const image2 = req.files.image2
        const image3 = req.files.image3
        const image4 = req.files.image4

        if (image1) {
            image1.mv('./public/book-images/'+id+'1.jpeg')
        }
        if (image2) {
            image2.mv('./public/book-images/'+id+'2.jpeg')
        }
        if (image3) {
            image3.mv('./public/book-images/'+id+'3.jpeg')
        }
        if (image4) {
            image4.mv('./public/book-images/'+id+'4.jpeg')
        }
   
        res.redirect('/a-product/product-view')
    })

})

// edit book

router.get('/product-edit/:id', verifyLogin , async(req , res) => {


    const categorry = await adminCategoryHelpers.findCategory()
        const category = categorry.category
        

    const id = req.params.id
    adminCategoryHelpers.viewProduct(id).then((response) => {

        const book = response.book
        console.log(book);

        res.render('admin/product-edit', {book , category })

    })
    
    })

    router.post('/product-edit/:id', (req , res) => {
        adminCategoryHelpers.editProduct(req.params.id , req.body).then( (response) => {
            res.redirect('/a-product/product-view')
          
                
                const id = req.params.id

                const image1 = req.files.image1
                const image2 = req.files.image2
                const image3 = req.files.image3
                const image4 = req.files.image4

            if (image1) {
                image1.mv('./public/book-images/' +id+ '1.jpeg')
            }
            if (image2) {
                image2.mv('./public/book-images/' +id+ '2.jpeg')
            }
            if (image3) {
                image3.mv('./public/book-images/' +id+ '3.jpeg')
            }
            if (image4) {
                image4.mv('./public/book-images/' +id+ '4.jpeg')
            }
        })
    })
    

// delete book

router.get('/delete-product/:idd',verifyLogin ,  (req , res) => {
    const id = req.params.idd
    adminCategoryHelpers.deleteProduct(id).then((response) => {
        res.redirect('/a-product/product-view')
    })

    
})

// add delete delivery rate

router.get ('/add-delivery-rate', verifyLogin , async (req , res) => {

    let shiprate = await adminCategoryHelpers.findDeliveryRate()  

    const errorMessage = req.session.errorMessage
    req.session.errorMessage = null
    const successMessage = req.session.successMessage
    req.session.successMessage = null
    
    res.render ('admin/Delivery-rate' , {errorMessage , successMessage , shiprate})
})

router.post ('/add-delivery-rate', (req , res) => {

    adminCategoryHelpers.addDeliveryRate(req.body).then( (response) => {

        if (response.status) {

        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage

        res.redirect ('/a-product/add-delivery-rate')
        

        }
})

})

router.post('/delete-delivery-rate', (req,res) => {
    adminCategoryHelpers.deleteDeliveryRate(req.body).then( (response) => {
        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage
        res.redirect('/a-product/add-delivery-rate')
    })
})

// admin banner management first

router.get('/banner-management', verifyLogin , async (req,res) => {

    let details = await adminCategoryHelpers.findFirstBanner()
    let firstBannerDetails = details.firstBanner
    const errorMessage = req.session.errorMessage
    req.session.errorMessage = null
    const successMessage = req.session.successMessage
    req.session.successMessage = null
    res.render('admin/banner-management', {errorMessage , successMessage , firstBannerDetails})
})

router.post('/banner-management', (req,res) => {
    adminCategoryHelpers.addFirstBanner(req.body).then( (response) => {
        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage
        res.redirect('/a-product/banner-management')
    })
})

router.post('/banner-management/firstDelete', (req,res) => {
    adminCategoryHelpers.deleteFirstBanner(req.body).then( (response) => {
        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage
        res.redirect('/a-product/banner-management')
    })
})

// admin banner management second

router.get('/second-banner', verifyLogin , async (req,res) => {

    let details = await adminCategoryHelpers.findSecondBanner()
    let secondBannerDetails = details.secondBanner
    const errorMessage = req.session.errorMessage
    req.session.errorMessage = null
    const successMessage = req.session.successMessage
    req.session.successMessage = null
    res.render('admin/secondBanner', {errorMessage , successMessage , secondBannerDetails})
})

router.post('/second-banner', (req,res) => {
    adminCategoryHelpers.addSecondBanner(req.body).then( (response) => {
        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage

        const id = response.secondBannerId

        const img1 = req.files.image1
        const img2 = req.files.image2

        console.log(img2 , img1 + "this is from image data");

        if (img1) {
            img1.mv('./public/second-banner-images/' + id + '1.jpeg')
        }

        if (img2) {
            img2.mv('./public/second-banner-images/' + id + '2.jpeg')
        }

        res.redirect('/a-product/second-banner')
    })
})

router.get('/delete-second-banner/:id', verifyLogin ,  (req,res) => {
    adminCategoryHelpers.deleteSecondBanner(req.params.id).then( (response)=> {
        console.log(req.params.id + "from delete second banner");
        req.session.errorMessage = response.errorMessage
        res.redirect('/a-product/second-banner')
    })
})


// admin banner management author

router.get('/author-banner', verifyLogin , async (req,res) => {

    let details = await adminCategoryHelpers.findAuthorBanner()
    let authorBannerDetails = details.authorBanner
    const errorMessage = req.session.errorMessage
    req.session.errorMessage = null
    const successMessage = req.session.successMessage
    req.session.successMessage = null
    res.render('admin/author-banner', {errorMessage , successMessage , authorBannerDetails})
})

router.post('/author-banner',async (req,res) => {
    await adminCategoryHelpers.addAuthorBanner(req.body).then( (response) => {
        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage

        const id = response.authorBannerId

        const img1 = req.files.image1

        if (img1) {
            img1.mv('./public/author-images/' + id + '.jpeg')
        }

        res.redirect('/a-product/author-banner')
    })
})

router.get('/delete-author-banner/:id', verifyLogin , async (req,res) => {
    await adminCategoryHelpers.deleteAuthorBanner(req.params.id).then( (response)=> {
        req.session.errorMessage = response.errorMessage
        res.redirect('/a-product/author-banner')
    })
})

// admin banner management promotion

router.get('/promotion-banner', verifyLogin , async (req,res) => {

    let details = await adminCategoryHelpers.findpromotionBanner()
    let promotionBannerDetails = details.promotionBanner 
    const errorMessage = req.session.errorMessage
    req.session.errorMessage = null
    const successMessage = req.session.successMessage
    req.session.successMessage = null
    res.render('admin/promotion-banner', {errorMessage , successMessage , promotionBannerDetails })
})

    router.post('/promotion-banner',async (req,res) => {
    await adminCategoryHelpers.addpromotionBanner(req.body).then( (response) => {
        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage

        const id = response.promotionBannerId

        const img1 = req.files.image1
        const img2 = req.files.image2

        if (img1) {
            img1.mv('./public/promotion-images/' + id + '1.jpeg')
        }
        if (img2) {
            img1.mv('./public/promotion-images/' + id + '2.jpeg')
        }

        res.redirect('/a-product/promotion-banner')
    })
})

router.get('/delete-promotion-banner/:id', verifyLogin , async (req,res) => {
    await adminCategoryHelpers.deletepromotionBanner(req.params.id).then( (response)=> {
        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage
        res.redirect('/a-product/promotion-banner')
    })
})

router.get('/edit-promotion-banner/:id', verifyLogin , async (req,res) => {

    console.log(req.params.id , "get method from edit promotion banner router");
    let details = await adminCategoryHelpers.viewPromotion(req.params.id)
        let promotionBannerDetails = details.promotionBanner 
        res.render('admin/edit-promotion', {promotionBannerDetails})
    })

router.post('/edit-promotion-banner/:id' , async (req,res) => {
        await adminCategoryHelpers.editPromotion(req.params.id , req.body).then( (response) => {
            req.session.successMessage = response.successMessage

            const id = req.params.id 
            const img1 = req.files.image1
            const img2 = req.files.image2

            if (img1) {
                img1.mv('./public/promotion-images/' + id + '1.jpeg')
            }
            if (img2) {
                img2.mv('./public/promotion-images/' + id + '2.jpeg')
            }

            res.redirect('/a-product/promotion-banner')
        })
    })

    // admin banner management  last promotion

router.get('/last-promotion', verifyLogin , async (req,res) => {

    let details = await adminCategoryHelpers.findpromotionLast()
    let promotionBannerDetails = details.lastpromotionBanner 
    const errorMessage = req.session.errorMessage
    req.session.errorMessage = null
    const successMessage = req.session.successMessage
    req.session.successMessage = null
    res.render('admin/last-promotion', {errorMessage , successMessage , promotionBannerDetails })
})

router.post('/last-promotion',async (req,res) => {
    await adminCategoryHelpers.addpromotionLast(req.body).then( (response) => {
        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage

        const id = response.lastpromotionBannerId

        const img1 = req.files.image1

        if (img1) {
            img1.mv('./public/last-promotion-images/' + id + '.jpeg')
        }
        

        res.redirect('/a-product/last-promotion')
    })
})

router.get('/delete-last-promotion-banner/:id', verifyLogin , async (req,res) => {
    await adminCategoryHelpers.deleteLastpromotionBanner(req.params.id).then( (response)=> {
        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage
        res.redirect('/a-product/last-promotion')
    })
})

router.get('/edit-last-promotion-banner/:id', verifyLogin , async (req,res) => {
    let details = await adminCategoryHelpers.viewLastPromotion(req.params.id)
        let promotionBannerDetails = details.lastpromotionBanner 
        res.render('admin/edit-last-promotion', {promotionBannerDetails})
    })

router.post('/edit-last-promotion-banner/:id' , async (req,res) => {
        await adminCategoryHelpers.editLastPromotion(req.params.id , req.body).then( (response) => {
            req.session.successMessage = response.successMessage

            const id = req.params.id 
            const img1 = req.files.image1

            console.log(id + "from edit");
            console.log(img1 + "from edit pic details");

            if (img1) {
                img1.mv('./public/last-promotion-images/' + id + '.jpeg')
            }

            res.redirect('/a-product/last-promotion')
        })
    })

    // admin banner management coupon

router.get('/coupon-banner', verifyLogin , async (req,res) => {

    let details = await adminCategoryHelpers.findCouponBanner()
    let couponBannerDetails = details.couponBanner 
    const errorMessage = req.session.errorMessage
    req.session.errorMessage = null
    const successMessage = req.session.successMessage
    req.session.successMessage = null
    res.render('admin/coupon-banner', {errorMessage , successMessage , couponBannerDetails})
})

router.post('/coupon-banner', (req,res) => {
    adminCategoryHelpers.addCouponBanner(req.body).then( (response) => {
        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage
        res.redirect('/a-product/coupon-banner')
    })
})

router.get('/delete-coupon-banner/:id', verifyLogin , (req,res) => {
    console.log(req.params._id + "from delete");
    adminCategoryHelpers.deleteCouponBanner(req.params.id).then( (response) => {
        req.session.errorMessage = response.errorMessage
        req.session.successMessage = response.successMessage
        res.redirect('/a-product/coupon-banner')
    })
})

//view add delete subscription plans

router.get('/add-subscription-plans' , (req,res) => {
    
res.render('admin/add-subscription-plans')
})

router.post('/add-subscription-plans', (req,res) => {
    adminCategoryHelpers.addSubscriptionPlans(req.body).then( (response) => {
        req.session.successMessage = response.successMessage
    })
   
    res.redirect('/a-product/view-plans')
})

// view - subscrption plans

router.get('/view-plans' ,async (req,res) => {
    const successMessage = req.session.successMessage
    req.session.successMessage = null
    const subscription_plans = await adminCategoryHelpers.findPlans()
    res.render('admin/view-plans', {subscription_plans , successMessage})
})

// delete - subscription plans

router.get('/delete-plan/:id', async(req,res) => {
    console.log(req.params.id , "id from delete subscription router");
    await adminCategoryHelpers.deletePlan(req.params.id).then ( (response) => {
        req.session.successMessage = response.successMessage
    })
    res.redirect('/a-product/view-plans')
})

// category and sub-category  ---  sample page

router.get('/get-subcategory/:category', async(req,res) => {   
const category =  await adminCategoryHelpers.findSubCategory(req.params.category)
    res.json(category)
})


module.exports = router;