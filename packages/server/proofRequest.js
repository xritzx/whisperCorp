const { POPA69 } = require('./vcHelpers/KYCAgeCredential');

// design your own customised authentication requirement here using Query Language
// https://0xpolygonid.github.io/tutorials/verifier/verification-library/zk-query-language/

const humanReadableAuthReason = 'Must score less than this number';

const credentialSubject = {
  marks: {
    $gt: 50,
  },
};

const proofRequest = POPA69(credentialSubject);

module.exports = {
  humanReadableAuthReason,
  proofRequest,
};
