const express = require("express");
const { Worker } = require("worker_threads");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const THREAD_COUNT = 4;

app.get("/non-blocking", (req, res) => {
  res.status(200).send("This Page is non-blocking");
});

function createWorker() {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./four-workers.js", {
      workerData: { thread_count: THREAD_COUNT },
    });
    worker.on("message", (data) => {
      resolve(data);
    });
    worker.on("error", (error) => {
      reject(error);
    });
  });
}

app.get("/blocking", async (req, res) => {
  const workerPromises = [];
  for (let i = 0; i < THREAD_COUNT; i++) {
    workerPromises.push(createWorker());
  }
  const thread_results = await Promise.all(workerPromises);
  const total =
    thread_results[0] +
    thread_results[1] +
    thread_results[2] +
    thread_results[3];
  res.status(200).send(`the rsult is ${total}`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
