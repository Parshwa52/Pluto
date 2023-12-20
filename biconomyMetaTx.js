import dotenv from "dotenv";
import config from "./config.js";
import sigUtil from "eth-sig-util";
dotenv.config();
const { PRIVATE_KEY, SERVER_ADDRESS } = process.env;

const domainType = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "verifyingContract", type: "address" },
  { name: "salt", type: "bytes32" },
];

const metaTransactionType = [
  { name: "nonce", type: "uint256" },
  { name: "from", type: "address" },
  { name: "functionSignature", type: "bytes" },
];

const processTransaction = async (
  web3,
  contract,
  selectedAddress,
  domainData
) => {
  if (contract) {
    console.log("Sending meta transaction");
    let serverAddress = SERVER_ADDRESS.toString();
    let nonce = await contract.methods.getNonce(serverAddress).call();
    let functionSignature = await contract.methods
      .onboard(selectedAddress, 10)
      .encodeABI();

    let message = buildMessage(nonce, serverAddress, functionSignature);

    const dataToSign = buildDataToSign(domainData, message);

    const signature = await sigUtil.signTypedMessage(
      new Buffer.from(PRIVATE_KEY, "hex"),
      { data: dataToSign },
      "V3"
    );

    let { r, s, v } = await getSignatureParameters(signature, web3); // same helper used in SDK frontend code

    let executeMetaTransactionData = await contract.methods
      .executeMetaTransaction(serverAddress, functionSignature, r, s, v)
      .encodeABI();

    let gasValue = await contract.methods
      .executeMetaTransaction(serverAddress, functionSignature, r, s, v)
      .estimateGas({ from: serverAddress });

    let txParams = buildTxParams(
      serverAddress,
      gasValue,
      executeMetaTransactionData
    );

    const signedTx = await web3.eth.accounts.signTransaction(
      txParams,
      `0x${PRIVATE_KEY}`
    );

    let receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
      (error, txHash) => {
        if (error) {
          return console.error(error);
        }
        console.log(`Transaction sent to blockchain with hash ${txHash}`);
      }
    );
    return receipt;
  } else {
    return "Please enter the proper contract address";
  }
};

const getSignatureParameters = (signature, web3) => {
  if (!web3.utils.isHexStrict(signature)) {
    throw new Error(
      'Given value "'.concat(signature, '" is not a valid hex string.')
    );
  }
  var r = signature.slice(0, 66);
  var s = "0x".concat(signature.slice(66, 130));
  var v = "0x".concat(signature.slice(130, 132));
  v = web3.utils.hexToNumber(v);
  if (![27, 28].includes(v)) v += 27;
  return {
    r: r,
    s: s,
    v: v,
  };
};

const buildMessage = (nonce, serverAddress, functionSignature) => {
  let message = {};
  message.nonce = parseInt(nonce);
  message.from = serverAddress;
  message.functionSignature = functionSignature;
  return message;
};

const buildDataToSign = (domainData, message) => {
  const dataToSign = {
    types: {
      EIP712Domain: domainType,
      MetaTransaction: metaTransactionType,
    },
    domain: domainData,
    primaryType: "MetaTransaction",
    message: message,
  };
  return dataToSign;
};

const buildTxParams = (serverAddress, gasValue, executeMetaTransactionData) => {
  let txParams = {
    from: serverAddress,
    to: config.contract.address,
    value: "0x0",
    gas: gasValue,
    data: executeMetaTransactionData,
  };
  return txParams;
};
export default processTransaction;
