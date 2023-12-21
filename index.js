//Importing all the packages
import express from "express";
import cron from "node-cron";
import { Biconomy } from "@biconomy/mexa";
import Web3 from "web3";
import Provider from "@truffle/hdwallet-provider";
import dotenv from "dotenv";
import cors from "cors";
import { IpFilter } from "express-ipfilter";
import helmet from "helmet";
import hpp from "hpp";

//Import data and functions
import config from "./config.js";
import processTransaction from "./biconomyMetaTx.js";
import rateLimitMiddleware from "./rateLimiter.js";

//Load environment variable data
dotenv.config();
const { API_URL, PRIVATE_KEY, BICONOMY_API_KEY } = process.env;

//Declare variables and constants
let web3;
let contract;
const POLYGON_MUMBAI_NETWORK_ID = 80001;
const QUEUE_EXECUTION_LIMIT = 100;
let IN_EXECUTION = false;

//In memory Queue on server
let jobQueue = [];

//Setup domain data for Biconomy Meta Transactions
let domainData = {
  name: "Transactor",
  version: "1",
  verifyingContract: config.contract.address,
  salt: "0x" + POLYGON_MUMBAI_NETWORK_ID.toString(16).padStart(64, "0"),
};

//Setup Express server for requests
const app = express();

//Express Middlewares
//List of blacklist IPs to block
const blackList = ["192.168.0.138"];

//Add CORS Middleware
app.use(cors());
app.use(express.json());

//Add IP Blocker Middleware
app.use(IpFilter(blackList));

//Add Rate Limiter Middleware
app.use(rateLimitMiddleware);

//Added Http Parameter Pollution Middleware
app.use(hpp());

//Added Cross Site Scripting Security Middleware
app.use(helmet.xssFilter());

//Added X-Powered-By Hide Middleware
app.use(helmet.hidePoweredBy());

//Express API endpoints
//1. Welcome Endpoint
app.get("/", function (req, res) {
  res.send("Welcome to Pluto!");
});

//2. Post transaction request
app.post("/api", async (req, res) => {
  let address = req.body.address;
  //If valid address is there
  if (address.length === 42) {
    jobQueue.push(req.body.address);
    res.send({
      status: "Request queued. You will get onboarding tokens in some time.",
    });
  } else {
    res.send({
      status: "Invalid Address",
    });
  }
});

//Server Starting with Biconomy Dapp Initialization
app.listen(3000, init());

//Added a cron job which runs every 10 seconds to process queue if it has QUEUE_EXECUTION_LIMIT requests
cron.schedule("*/10 * * * * *", () => {
  //Execute this cron job only when previous job has completed execution
  if (IN_EXECUTION === false) {
    processQueue();
  }
});

//Biconomy Dapp and Provider Initialization
async function init() {
  const provider = new Provider(PRIVATE_KEY, API_URL);

  domainData.chainId = POLYGON_MUMBAI_NETWORK_ID;

  const biconomy = new Biconomy(provider, {
    apiKey: BICONOMY_API_KEY,
    debug: true,
  });
  web3 = new Web3(biconomy);

  biconomy
    .onEvent(biconomy.READY, () => {
      console.log("Biconomy is ready!");
      contract = new web3.eth.Contract(
        config.contract.abi,
        config.contract.address
      );
    })
    .onEvent(biconomy.ERROR, (error, message) => {
      console.log(error);
    });
}

async function processQueue() {
  let len = jobQueue.length;
  console.log("Current job queue length is", len);

  //Creating a separate queue just for execution
  let executionQueue = JSON.parse(JSON.stringify(jobQueue));

  if (len >= QUEUE_EXECUTION_LIMIT) {
    queueExecutor(len, executionQueue);
  }
  console.log("Cron job executed at:", new Date().toLocaleString());
}

function resultLogger(result, userAddress) {
  if (result.transactionHash) {
    console.log(
      `${new Date().toLocaleString()} Transaction Success for address ${userAddress}`
    );
  } else {
    console.log(
      `${new Date().toLocaleString()} Transaction Failed for address ${userAddress}`
    );
  }
}

async function queueExecutor(len, executionQueue) {
  IN_EXECUTION = true;
  for (let i = 0; i < len; i++) {
    const result = await processTransaction(
      web3,
      contract,
      executionQueue[i],
      domainData
    );
    resultLogger(result, executionQueue[i]);
  }
  executionQueue = [];
  jobQueue.splice(0, QUEUE_EXECUTION_LIMIT);
  IN_EXECUTION = false;
}

export default app;
