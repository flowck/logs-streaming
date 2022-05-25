const { randomUUID } = require("crypto");
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const { EventEmitter } = require("events");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 4000;
const JOB_DURATION_IN_SECONDS = 120;

app.use(bodyParser.json());

// Handle web sockets connection here
// Each connection creates a new socket
io.on("connection", (socket) => {
  console.log("A client is connected");

  socket.on("disconnect", () => {
    console.log("A client just left");
  });
});

/**
 * Handle long-running operations with event handlers
 */
const events = new EventEmitter();
const ON_JOB_CREATION = "ON_JOB_CREATION";

events.on(ON_JOB_CREATION, (id) => {
  console.log(`Job ${id} has just been created`);

  // Create a new namespace
  const namespace = `/ws/jobs/${id}`;
  const jobNamespace = io.of(namespace);

  jobNamespace.on("connection", (socket) => {
    let count = 0;
    setInterval(() => {
      jobNamespace.emit("log", "Log " + count);
      console.log("Emitted", `Log + ${count}`);
      count++;

      if (count === 10) {
        // Clean up
        socket.removeAllListeners();
        jobNamespace.disconnectSockets();
      }
    }, 10 * 1000);
  });

  console.log(`Namespace ${namespace} has just been created`);
});

/**
 * HTTP interface
 */

// Create new job
app.post("/jobs", (req, res) => {
  const id = randomUUID();
  const duration = req.body.duration || JOB_DURATION_IN_SECONDS;

  // Let the event loop handle the job processing in the least busy moment and avoid blocking the it
  events.emit(ON_JOB_CREATION, id);

  res.json({
    id,
    duration,
    message: `Job was created. Observe the logs with a Socket.io client at http://localhost:${PORT}/${id}`,
  });
});

server.listen(PORT, () => console.log(`Service is running at http://localhost:${PORT}`));
