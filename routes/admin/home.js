const express = require ('express')
const { route } = require('..')
const router = express.Router()
var productHelpers = require ('../../helpers/admin_product')

router.use((req, res, next) => {

    if (req.session.admin) {
        let admin = req.session.admin
        next()
    }else{
        res.redirect('/a-login')

    }
})

router.get ('/', async(req , res) => {
    dp = await productHelpers.findDP()
    const admin = req.session.admin

    res.render ('admin/home', { admin , dp})
})

router.get ('/a-logout', (req , res) => {
 

    req.session.admin=null;
    res.redirect('/a-login')
  })

  router.get ('/sample', (req , res) => {

    const admin = req.session.admin

    

    res.render ('admin/sample', { admin })
})




module.exports = router