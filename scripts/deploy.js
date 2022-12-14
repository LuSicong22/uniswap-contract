const hre = require("hardhat");

async function main() {
  const SicoToken = await hre.ethers.getContractFactory("SicoToken");
  const sicoToken = await SicoToken.deploy(100000000, 50);

  await sicoToken.deployed();
  console.log("Sico Token deployed: ", sicoToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
