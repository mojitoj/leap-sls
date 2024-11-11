const { validateSlsRequest } = require("../lib/validators");
const { label } = require("../lib/labeling/labeler");

async function post(req, res, next) {
  try {
    validateSlsRequest(req);
    const updatedBody = await label(req.body);
    res.send(updatedBody);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  post
};
