const codeEquals = (coding1, coding2) =>
  coding1.code === coding2.code && coding1.system === coding2.system;

const removeRedundantCodes = (codes) =>
  codes.filter(
    (code, index) => codes.findIndex((c) => codeEquals(c, code)) === index
  );

const codesUnion = (codes1, codes2) =>
  removeRedundantCodes([...codes1, ...codes2]);

module.exports = {
  codeEquals,
  removeRedundantCodes,
  codesUnion
};
