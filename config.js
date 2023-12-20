let config = {};
config.contract = {
  address: "0xD93DB874C93b9975B5f644DAC28950F133b8C437",
  abi: [
    {
      inputs: [
        {
          internalType: "contract Plutoken",
          name: "tokenContractAddress",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "userAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address payable",
          name: "relayerAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "functionSignature",
          type: "bytes",
        },
      ],
      name: "MetaTransactionExecuted",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "userAddress",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "functionSignature",
          type: "bytes",
        },
        {
          internalType: "bytes32",
          name: "sigR",
          type: "bytes32",
        },
        {
          internalType: "bytes32",
          name: "sigS",
          type: "bytes32",
        },
        {
          internalType: "uint8",
          name: "sigV",
          type: "uint8",
        },
      ],
      name: "executeMetaTransaction",
      outputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      stateMutability: "payable",
      type: "function",
      payable: true,
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "getNonce",
      outputs: [
        {
          internalType: "uint256",
          name: "nonce",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
      constant: true,
    },
    {
      inputs: [],
      name: "tokenContract",
      outputs: [
        {
          internalType: "contract Plutoken",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
      constant: true,
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "onboard",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      payable: true,
    },
  ],
};

export default config;
