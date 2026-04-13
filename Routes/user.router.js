import express from "express"
import { authorize } from "../Middlewares/role.middleware.js";
import { protect  } from "../Middlewares/auth.middleware.js";  

const router= express.Router()

router.post("/profile",protect,(req,res)=>{
    res.status(200).json({user:req.user})
})

router.post("/admin",protect,authorize("admin"),(req,res)=>{
    res.status(200).json({message:"Admin only"})
})
export default router
