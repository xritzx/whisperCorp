// module.exports = {
//   // VC type: KYCAgeCredential
//   // https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld
//   KYCAgeCredential: (credentialSubject) => ({
//     id: 1,
//     circuitId: "credentialAtomicQuerySigV2",
//     query: {
//       allowedIssuers: ["*"],
//       type: "KYCAgeCredential",
//       context:
//         "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld",
//       credentialSubject,
//     },
//   }),
//   // See more off-chain examples
//   // https://0xpolygonid.github.io/tutorials/verifier/verification-library/zk-query-language/#equals-operator-1
// };

// module.exports = {
//   KYCAgeCredential: (credentialSubject) => ({
//     circuitId: 'credentialAtomicQuerySigV2',
//     id: 1701885776,
//     query: {
//       allowedIssuers: ['*'],
//       context:
//         'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
//       credentialSubject,
//       type: 'KYCAgeCredential',
//     },
//   }),
// };

/**
 * {
  "circuitId": "credentialAtomicQuerySigV2",
  "id": 1701887102,
  "query": {
    "allowedIssuers": [
      "*"
    ],
    "context": "ipfs://QmcC6EezycyZ3KQP9r4VaHkTcWV2qtkkgzgzT9FZ3q9rxD",
    "credentialSubject": {
      "marks": {
        "$lt": 100
      }
    },
    "type": "POPA69"
  }
}
 */
module.exports = {
  POPA69: (credentialSubject) => ({
    circuitId: 'credentialAtomicQuerySigV2',
    id: 1701887102,
    query: {
      allowedIssuers: ['*'],
      context: 'ipfs://QmcC6EezycyZ3KQP9r4VaHkTcWV2qtkkgzgzT9FZ3q9rxD',
      credentialSubject: credentialSubject,
      type: 'POPA69',
    },
  }),
};
