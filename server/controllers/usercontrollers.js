import User from "../models/user.js";
 import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Chat from "../models/Chat.js";



//  generate JWT token

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, 
        { expiresIn: "30d" });
}

 // api to register user

 export const registerUser = async (req, res) => {
   const { name, email, password } = req.body;

   try {
      const userExists = await User.findOne({ email });

      if (userExists) {
         return res.json({ success: false, message: "User already exists" });
      }

      const user = new User({ name, email, password });
      await user.save();

      const token = generateToken(user._id);

      res.json({
         success: true,
         message: "User registered successfully",
         token
      });

   } catch (error) {
      res.json({ success: false, message: error.message });
   }
};
     

        // api to login user

     export const loginUser = async (req, res) => {

       const { email, password } = req.body;

    try {
       
        const user = await User.findOne({ email });

        if (user) {

             const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

             const token = generateToken(user._id);

           return res.json({ success: true, message: "User logged in successfully", token });

          }
             }

       return res.json({ success: false, message: "Invalid email or password" });

    }     catch (error) {

        res.json({ success: false, message: error.message });
    } 
}; 


//api to get user data

export const getUser = async (req, res) => { 

    try {
        const user = req.user;

        res.json({ success: true, user });
        
    } catch (error) {
        res.json({ success: false, message: error.message });
    }

}

//api to get published image

export const getPublishedImages = async (req, res) => {
  try {

    const userId = req.user._id;

    // ONLY CURRENT USER CHATS
    const chats = await Chat.find({ userId });

    let images = [];

    chats.forEach((chat) => {

      chat.messages.forEach((msg) => {

        // only image messages
        if (msg.isImage === true && msg.isPublished === true) {

          images.push({
            imageUrl: msg.content,
            userName: chat.userName,
            timestamp: msg.timestamp
          });

        }

      });

    });

    // latest first
    images.sort((a, b) => b.timestamp - a.timestamp);

    res.json({
      success: true,
      images
    });

  } catch (error) {

    res.json({
      success: false,
      message: error.message
    });

  }
};
   



