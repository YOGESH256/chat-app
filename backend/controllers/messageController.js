const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const User = require('../models/userModel');
const Message = require('../models/messageModel')
const Chat = require('../models/chatModel')
const { all } = require("../routes/userRoutes");




const sendMessage = expressAsyncHandler(async (req, res) => {

    const { content, chatId } = req.body;

     if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
    }
    
    const newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        
    }
    try {

        var message = await Message.create(newMessage);
        message = await message.populate([{path: 'sender', select: 'name pic'}, {path: 'chat'}]);
        //   message = await message.populate("sender", "name pic").execPopulate();
   
    message = await User.populate(message, {
      path: "chat.user",
      select: "name pic email",
    });


    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
  
  
   

  
})
 


const allMessages = expressAsyncHandler(async (req, res) => {

  
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
   

  
})


module.exports = { sendMessage , allMessages};