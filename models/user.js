const mongoose  = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema  = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be a positive number');
            }
        }
    },
    email:{
        type: String,
        required: true,
        unique:true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid!');
            }
        }

    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength: 7,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please enter your password!');
            }else if(validator.equals(value.toLowerCase(),"password")){
                throw new Error('Password is invalid!');
            }else if(validator.contains(value.toLowerCase(), "password")){
                throw new Error('Password should not contain password!');
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required: true
        }
    }],
    createdAt:{
        type: Date,
        default: Date.now
    }
});


UserSchema.methods.newAuthToken = function(){
    const user  = this;
    const token =  jwt.sign({ _id: user.id.toString() },'thisismynewblog', {expiresIn: "7 days"});
    user.tokens = user.tokens.concat({ token });
    user.save();
    return token;
};


UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch)=> {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
UserSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});


UserSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author'
});

const User = mongoose.model('User', UserSchema);


module.exports = User;