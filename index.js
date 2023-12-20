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

//Declare variables
let web3;
let contract;
const POLYGON_MUMBAI_NETWORK_ID = 80001;

//In memory Queue on server
let queue = [];

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
//List of blacklist IPs
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
  queue.push(req.body.address);
  res.send({
    status: "Request queued",
  });
});

//Server Starting with Biconomy Dapp Initialization
app.listen(3000, init());

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
  let len = queue.length;
  console.log("Current queue length is", len);
  if (len == 2) {
    for (let i = 0; i < len; i++) {
      console.log("queue=", queue);
      const result = await processTransaction(
        web3,
        contract,
        queue[i],
        domainData
      );
      if (result.transactionHash) {
        console.log("Transaction Success");
      } else {
        console.log("Transaction Failed");
      }
    }
    queue = [];
  }
  console.log("Cron job executed at:", new Date().toLocaleString());
}
cron.schedule("* * * * *", () => {
  processQueue();
});

export default app;
