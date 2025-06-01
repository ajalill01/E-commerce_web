const Admin = require('../model/Admin')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const login = async(req,res)=>{
    try{
        const {username,password} = req.body;

        const existingUser = await Admin.findOne({username});

        if(!existingUser){
            return res.status(400).json({
                success : false,
                message : 'User does not exist'
            })
        }

        const isPasswordMtach = await bcrypt.compare(password,existingUser.password)

        if(!isPasswordMtach){
            return res.status(400).json({
                success : false,
                message : 'this password is incorrect please try again'
            })
        }
        
        const token = jwt.sign(
            { 
                userId : existingUser._id,
                username : existingUser.username,
                role: existingUser.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn : '30d'
            }
        )

        res.status(200).json({
            success : true,
            message : 'Logged in successful',
            token : token
        })
    }

    catch(e){
        console.log('Error from log in\n',e)
        res.status(500).json({
            success : false,
            message : 'Somthing went wrong with login'
        })
    }
}

module.exports = {login}