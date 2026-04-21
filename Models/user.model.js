import mongoose from "mongoose"

const userSchema= new mongoose.Schema({
    name:String,
    email:{type:String,unique:true},
    refreshTokens: {
        type: [String],
        validate: {
          validator: function (val) {
            return val.length <= 10;
          },
          message: "Cannot have more than 10 logged in devices"
        },
      },
    password:String,
    role:{type:String,default:"user"}
},{timestamps:true})

export default  mongoose.model("userSchema", userSchema)
