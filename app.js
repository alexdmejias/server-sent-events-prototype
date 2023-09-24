const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());

let clients = [];
const words = [];

app.get("/status", (req, res) => {
  res.json({
    clients: clients.length,
    words,
  });
});

app.get("/events", (req, res) => {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };

  res.writeHead(200, headers);

  const data = `data: ${JSON.stringify(words)}\n\n`;

  res.write(data);

  const clientId = Date.now();
  const newClient = {
    clientId,
    response: res,
  };

  clients.push(newClient);

  req.on("close", () => {
    clients = clients.filter((curr) => curr.clientId !== clientId);
  });
});

const sendEventToAll = (data) => {
  clients.forEach((client) => {
    client.response.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

app.post("/add-word", (req, res) => {
  const word = req.body;

  console.log("req.body", req.body);

  words.push(word);

  res.json(word);

  return sendEventToAll(word);
});

module.exports = app;
