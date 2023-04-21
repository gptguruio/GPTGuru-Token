import Web3 from "web3";

export default function (bn) {
  return parseFloat(Web3.utils.fromWei(bn));
}