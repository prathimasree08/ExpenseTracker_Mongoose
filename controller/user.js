const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.postSignUpUser = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    try{
        const user = await User.find({'email': email })
        if (user.length>0) {
            return res.status(409).json({ error: "User already exists" });
        }
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, async (err, hash)=>{
            if(err){
              console.log(err);  
            }
            const newUser= new User({
                name: name,
                email: email,
                password: hash
            });
            const result = await newUser.save()
              console.log(result)
              return res.json(result);
        })
       
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    };
}
function generateToken(id){
  return jwt.sign({userId: id}, 'secretkey')
}

exports.postLoginUser = async (req, res, next) =>{
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ 'email': email });
      if (!user || user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Incorrect password' });
      }
      // console.log(res)
      return res.status(200).json({token: generateToken(user.id)});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  exports.getUserStatus = (req, res, next) => {
    const userId = req.user.id;
    User.findById(userId)
      .then((user) => {
        return res.json(user.isPremiumUser);
      })
      .catch((err) => console.log(err));
  };
  