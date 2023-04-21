const GptGuruToken = artifacts.require("GptGuruToken");

module.exports = function (deployer) {
  deployer.deploy(GptGuruToken);
};
