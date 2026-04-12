import mongoose from "mongoose"

const userSchema= new mongoose.Schema({
    name:String,
    email:{type:String,unique:true},
    refreshtoken:String,
    password:String,
    role:{type:String,default:"user"}
},{timestamps:true})

export default  mongoose.model("userSchema", userSchema)