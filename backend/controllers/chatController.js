
const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const User = require('../models/userModel');
const { all } = require("../routes/userRoutes");
const Chat = require('../models/chatModel');
const { default: mongoose } = require("mongoose");



const accessChat = expressAsyncHandler(async (req, res) => {
    
    const { userId } = req.body
    
    if (!userId)
       {
        console.log('userId not sent with the request');
        return res.status(400);
    }
    console.log(req.user._id, mongoose.Types.ObjectId(userId));
    console.log(req.user._id.toString() , userId);
    

   var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { user: { $elemMatch: { $eq: req.user._id.toString() } } },
      { user: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("user", "-password")
    .populate("latestMessage");
    console.log(isChat);
    


     isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
     });
    
    
    console.log(isChat);
    
    
    if (isChat.length > 0)
        {
        res.send(isChat[0]);
    }
    else
        {
        var charData = {
            chatName : "sender",
            isGroupChat: "false",
            user: [req.user._id , userId]
        }
        try {
            const createData= await Chat.create(charData);

            const FullChat = await Chat.findOne({ _id: createData._id }).populate('user', '-password');

            res.status(200).send(FullChat);

            

        

            
        } catch (error) {
            res.status(400);
      throw new Error(error.message);
        }
        }
    
    
    


    
})




const fetchChat = expressAsyncHandler(async (req, res) => {
  try {
      console.log("Ji");
    await Chat.find({ user: { $elemMatch: { $eq: req.user._id } } })
      .populate("user", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        console.log(results.length);
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
    
})

const createGroupChat = expressAsyncHandler(async (req, res) => {

     if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
    }
    var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
    }
    
    users.push(req.user);

      try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      user: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("user", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }



 
});


const renameGroup = expressAsyncHandler( async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("user", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

const removeFromGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { user: userId },
    },
    {
      new: true,
    }
  )
    .populate("user", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { user: userId },
    },
    {
      new: true,
    }
  )
    .populate("user", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});





module.exports = { accessChat , fetchChat , createGroupChat , renameGroup , addToGroup , removeFromGroup};