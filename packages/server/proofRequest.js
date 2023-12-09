const { EMP } = require('./vcHelpers/KYCAgeCredential');

// design your own customised authentication requirement here using Query Language
// https://0xpolygonid.github.io/tutorials/verifier/verification-library/zk-query-language/

const humanReadableAuthReason =
  'Please login with your polygon ID issued by your Corp';
const proofRequest = EMP();

module.exports = {
  humanReadableAuthReason,
  proofRequest,
};
