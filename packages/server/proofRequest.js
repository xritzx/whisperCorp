const { EMP01 } = require('./vcHelpers/KYCAgeCredential');

// design your own customised authentication requirement here using Query Language
// https://0xpolygonid.github.io/tutorials/verifier/verification-library/zk-query-language/

const humanReadableAuthReason = 'Please login with your polygon ID issued by your Corp';
const proofRequest = EMP01();

module.exports = {
  humanReadableAuthReason,
  proofRequest,
};
