export const CERTIFICATE_REGISTRY_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "sha3Hash", "type": "bytes32" },
      { "indexed": false, "internalType": "string", "name": "cid", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "issuer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "CertificateRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "sha3Hash", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "revoker", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "CertificateRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "issuer", "type": "address" }
    ],
    "name": "IssuerAuthorized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "issuer", "type": "address" }
    ],
    "name": "IssuerDeauthorized",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_issuer", "type": "address" }],
    "name": "authorizeIssuer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "authorizedIssuers",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_issuer", "type": "address" }],
    "name": "deauthorizeIssuer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "_sha3Hash", "type": "bytes32" }],
    "name": "getCertificate",
    "outputs": [
      { "internalType": "bytes32", "name": "sha3Hash", "type": "bytes32" },
      { "internalType": "string", "name": "cid", "type": "string" },
      { "internalType": "bytes", "name": "signature", "type": "bytes" },
      { "internalType": "address", "name": "issuer", "type": "address" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bool", "name": "isRevoked", "type": "bool" },
      { "internalType": "bool", "name": "exists", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_sha3Hash", "type": "bytes32" },
      { "internalType": "string", "name": "_cid", "type": "string" },
      { "internalType": "bytes", "name": "_signature", "type": "bytes" }
    ],
    "name": "registerCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "_sha3Hash", "type": "bytes32" }],
    "name": "revokeCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
