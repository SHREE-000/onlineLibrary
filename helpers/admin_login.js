const collection = require ('../config/collections')
const db = require ('../config/connection')
const { ObjectId } = require ('mongodb')
const async = require('hbs/lib/async')
const { response } = require('express')


module.exports = {

doAdminLogin : (adminData) => {
    return new Promise ( async (resolve , reject) => {

        const response = {}

        const admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne ( {
            admin_email : adminData.admin_email , admin_password : adminData.admin_password 
        })

        if (admin) {
            response.status = true
            response.admin = admin
            return resolve (response)   
        }else {

            const emailUser = db.get().collection(collection.ADMIN_COLLECTION).findOne( {admin_email : adminData.admin_email} )

            if (!emailUser) {
                return resolve({errorMessage : "Invalid Email" , status : false})
            }


            const passwordUser = db.get().collection(collection.ADMIN_COLLECTION).findOne( {admin_password : adminData.admin_password})

            if (!passwordUser) {
                return resolve ( {errorMessage : "Invalid Password", status : false})
            }

            // const Blocked = db.get().collection(collection.ADMIN_COLLECTION).findOne ( {admin_email : adminData.admin_email , admin_password : adminData.admin_password} )

            // if (!Blocked) {
            //     return resolve ( {errorMessage : "Your Account Has Been Blocked", status : false} )
            // }

            return resolve ( {errorMessage : "User Not Found", status : false})
        }
    })
}

}