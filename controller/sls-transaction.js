const { validateSlsRequest } = require("../lib/validators");
const { labelingTransaction } = require("../lib/labeling/labeler");

async function post(req, res, next) {
  try {
    validateSlsRequest(req);
    const labelingTransactionResult = await labelingTransaction(req.body);
    res.send(labelingTransactionResult);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  post
};
