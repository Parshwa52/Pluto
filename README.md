# Pluto

A backend system to handle a large number of meta transactions using Blockchain and Node.js

## Overview

Pluto is a scalable blockchain based meta transaction system for users. It allows large number of users to claim their 10 ERC20 Plutokens from server without paying any gas fees.

## Queue Management

Server is using 2 queues:

1. Request Queue:
   This queue captures all the requests from users can stores it.

2. Execution Queue:
   This queue executes Blockchain Meta Transactions sequentially.

## Transaction processing

A cron job is running every 10 seconds to check the size of queue. Whenever the request queue size reaches 100, it sends all these requests to execution queue and execution queue processes the meta transactions one by one.

A rate limiter is also added which allows only 1 million requests per minute.

## Meta transactions

There are 2 contracts deployed on Polygon Mumbai Testnet

1. Plutoken:
   This is standard ERC20 Token contract with total supply of 10000000 tokens.

2. Transactor:
   This contract transfers 10 tokens to onboard new users to dapp.

Contract Addresses:

Plutoken -
[0x3f14934530DC62dA277334734fF6FA5d46fe086e](https://mumbai.polygonscan.com/token/0x3f14934530dc62da277334734ff6fa5d46fe086e)

Transactor - [0xD93DB874C93b9975B5f644DAC28950F133b8C437](https://mumbai.polygonscan.com/address/0xD93DB874C93b9975B5f644DAC28950F133b8C437)

The meta transactions are done using Mexa package of Biconomy and EIP712 smart contracts as given in this repository.

## Error Handling and Monitoring

The errors are constantly monitored for each and every request on render.com dashboard.

## Security

### Secure Communication

The communication is done via HTTPS/TLS.

### Ddos Mitigation

1. IP Block Filter
2. Rate Limiter - 1 million request/ minute limit
3. Http Parameter Pollution
4. Cross Site Scripting Security
5. X-Powered-By

### Intrusion Detection

Traffic Anomalies can be used to find intruders. Intruders IP can be blocked by adding their IPs to block list.

### Regular Security Testing:

Regular security testing, stress tests can be performed using specialized Saas softwares.

### Incident Reporting and Monitoring

The incident reporting and monitoring is done on render.com dashboard.

## Deployed version

This web service is deployed on render.com

URL - https://pluto-0unp.onrender.com

## API Endpoints

1. GET / <br/>
   This is a welcome endpoint just to test health of application.

2. POST /api <br/>
   Request Body:
   {
   "address" : "YOUR WALLET ADDRESS"
   }

   Response:
   {
   "status": "Request queued. You will get onboarding tokens in some time."
   }

   In this endpoint, you wallet address will receive 10 onboarding tokens when the execution queue is run.

## Postman Collection

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://god.gw.postman.com/run-collection/19975338-84d29ba1-53b0-425d-bf38-7bb253a746f9?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D19975338-84d29ba1-53b0-425d-bf38-7bb253a746f9%26entityType%3Dcollection%26workspaceId%3Df35cc5d4-985d-454a-bea8-4472bb99be0b)
