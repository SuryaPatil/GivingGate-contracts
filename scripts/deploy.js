const hre = require("hardhat");

// Returns the Ethere balance of a given address
async function getBalance(address){
  const provider = ethers.getDefaultProvider();
  const balanceBigInt = await provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt)
}

// Logs Ether balances for a list of addresses
async function printBalances(addresses){
  let idx = 0;
  for(const address of addresses){
    console.log(`${address} : `, await getBalance(address))
    idx++; 
  }
}

// Logs the deposits stored on-chain 
async function printDonations(donations){
  for(const donation of donations){
    const timestamp = donation.timestamp;
    const company = donation.name; 
    const address = donation.from;
    const amount = donation.amount; 
    console.log(`At ${timestamp}, ${company} (${address}) donated: ${await hre.ethers.utils.formatEther(amount)}`);
  }
}

async function main(){
  // Get example accounts
  const [owner, donor, donor2, donor3, recip] = await hre.ethers.getSigners();

  // Get contract to deploy and deploy
  const Donate = await hre.ethers.getContractFactory("Vault")
  const donate = await Donate.deploy();
  await donate.deployed();
  console.log("Donation made to ", donate.address)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });