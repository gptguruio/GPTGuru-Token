  
// Returns the time of the last mined block in seconds
export default async function latestTime () {
    return (await web3.eth.getBlock('latest')).timestamp;
  }