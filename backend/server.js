

const express = require("express");
const { chats } = require('./data/data.js');
const connectDB = require("./config/db");
const cors = require('cors');
connectDB();
const app = express();
const dotenv = require('dotenv');

const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes')
const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");






app.use(express.json());
app.use(cors());
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes )

app.use(notFound)
app.use(errorHandler)


const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log("RUNNING THE PORT" + PORT);
})


const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'https://frontend-oq0s.onrender.com'
    }
}
)


io.on("connection", (socket) => {
    console.log("connected to socket io");

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit("connected")
        
    })
     socket.on('join chat', (room) => {
        socket.join(room);
        console.log("User joined the room" + room);
        
     })

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
    
     socket.on('new message', (newMessageReceived) => {
         var chat = newMessageReceived.chat;
         console.log("Ji");
         if (!chat.user)
         {
             console.log("Chat users not defined");
                
         }

         chat.user.forEach(u => {
             if (u._id === newMessageReceived.sender._id) return;
             

             socket.in(u._id).emit("message received", newMessageReceived);

            
         });
        
    })
})
