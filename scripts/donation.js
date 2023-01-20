// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
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

async function main() {
  // Get example accounts
  const [owner, donor, donor2, donor3, recip] = await hre.ethers.getSigners();

  // Get contract to deploy and deploy
  const Donate = await hre.ethers.getContractFactory("Vault")
  const donate = await Donate.deploy();
  await donate.deployed();
  console.log("Donation made to ", donate.address)

  // Check balances before donations
  const addresses = [owner.address, donor.address, donate.address];
  console.log("== start ==")
  //await printBalances(addresses)
  let ownerBalance = await owner.getBalance();
  let donorBalance = await donor.getBalance();
  let vaultBalance = await donate.getBalance();
  let recipBalance = await recip.getBalance();
  console.log(`Owner balance (${owner.address}): `,await hre.ethers.utils.formatEther(ownerBalance))
  console.log(`Donor balance (${donor.address}): `,await hre.ethers.utils.formatEther(donorBalance))
  console.log(`Vault balance (${donate.address}): `,await hre.ethers.utils.formatEther(vaultBalance))
  console.log(`recip balance (${recip.address}): `,await hre.ethers.utils.formatEther(recipBalance))

   // Make donations
  const donation = {value: hre.ethers.utils.parseEther("1")}
  await donate.connect(donor).donate("Apple",donation)
  await donate.connect(donor2).donate("Google",donation)
  await donate.connect(donor3).donate("Walmart",donation)

  // Check balances after donations
  console.log("\n == donated == \n")
//  await printBalances(addresses)
  ownerBalance = await owner.getBalance();
  donorBalance = await donor.getBalance();
  vaultBalance = await donate.getBalance();
  recipBalance = await recip.getBalance();
  console.log(`Owner balance (${owner.address}): `,await hre.ethers.utils.formatEther(ownerBalance))
  console.log(`Donor balance (${donor.address}): `,await hre.ethers.utils.formatEther(donorBalance))
  console.log(`Vault balance (${donate.address}): `,await hre.ethers.utils.formatEther(vaultBalance))
  console.log(`recip balance (${recip.address}): `,await hre.ethers.utils.formatEther(recipBalance))

  // Distribute funds
  console.log("\n == distributed == \n");
  //const release = {value: hre.ethers.utils.parseEther("1")}
  const txn = await donate.connect(recip).sendEther();
  recipBalance = await recip.getBalance();
  vaultBalance = await donate.getBalance();
  console.log(`Vault balance (${donate.address}): `,await hre.ethers.utils.formatEther(vaultBalance))
  console.log(`recip balance (${recip.address}): `,await hre.ethers.utils.formatEther(recipBalance))


  // Check balance after distributing

  // View all donations to the charity
  console.log("\n == donations == \n");
  const donations = await donate.getDonations();
  printDonations(donations) 

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
