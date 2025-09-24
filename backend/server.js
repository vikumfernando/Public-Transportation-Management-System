const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { Server } = require("socket.io"); //new
const http = require("http");

const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 8070;

app.use(cors());
app.use(express.json());

const server = http.createServer(app); //new

const URL = process.env.MONGODB_URL;

const io = new Server(server, {
  cors: { origin: "*" } // new
});

app.set("io", io);

mongoose.connect(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.once("open", () => {
    console.log("MongoDB connection established successfully");
})

//Add routes here later

const busStopRouter = require("./routes/Stops.js");
const busRouter = require("./routes/Busses.js");
const routesRouter = require("./routes/Routes.js");
const schedulesRouter = require("./routes/Schedules.js");
const authRouter = require("./routes/auth.js");
const usersRouter = require("./routes/users.js");

app.use("/Stops", busStopRouter);
app.use("/Busses", busRouter);
app.use("/Routes", routesRouter);
app.use("/Schedules", schedulesRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter);


//changed from app to server
server.listen(PORT, () => {
  console.log(`Server is up and running on port number: ${PORT}`);
});