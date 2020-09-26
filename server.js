const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const { ChatClient } = require("twitch-chat-client");
const { StaticAuthProvider } = require("twitch-auth");
const fs = require("fs");

let contents = fs.readFileSync("tokens", "utf8");
let [clientID, accessToken] = contents.trim().split(",");
const auth = new StaticAuthProvider(clientID, accessToken);

let chatClient;

app.use(express.static(__dirname + "/build/client"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/build/client/");
});

io.on("connection", (socket) => {
  socket.on("twitch_channel", (msg) => {
    chatClient = new ChatClient(auth, { channels: [msg] });
    chatClient.connect().then(() => {
      socket.emit("twitch_connection", "Twitch Chat Client verbunden!");
    });
    socket.on("chat_reply", (msg) => {
      chatClient.say("jasminaxrose", msg);
    });
    chatClient.onMessage((channel, user, message) => {
      socket.emit("chat_message", user + ":" + message);
    });
  });
});

http.listen(3000, () => {
  console.log("listening on localhost:3000");
});
