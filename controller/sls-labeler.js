const { validateSlsRequest } = require("../lib/validators");
const { label } = require("../lib/labeling/labeler");

async function post(req, res, next) {
  validateSlsRequest(req);
  const updatedBody = await label(req.body);
  res.send(updatedBody);
}

module.exports = {
  post
};
