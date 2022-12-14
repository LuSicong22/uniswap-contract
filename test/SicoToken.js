const { expect } = require("chai");
const hre = require("hardhat");

describe("SicoToken contract", function () {
  // global vars
  let Token;
  let sicoToken;
  let owner;
  let addr1;
  let addr2;
  let tokenCap = 100000000;
  let tokenBlockReward = 50;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("SicoToken");
    [owner, addr1, addr2] = await hre.ethers.getSigner();

    sicoToken = await Token.deploy(tokenCap, tokenBlockReward);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await sicoToken.owner().to.equal(owner.address));
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await sicoToken.balanceOf(owner.address);
      expect(await sicoToken.totalSupply().to.equal(ownerBalance));
    });

    it("Should set the max capped supply to the argument provided during deployment", async function () {
      const cap = await sicoToken.cap();
      expect(Number(hre.ethers.utils.formatEther(cap))).to.equal(tokenCap);
    });

    it("Should set the blockReward to the argument provided during deployment", async function () {
      const blockReward = await sicoToken.blockReward();
      expect(Number(hre.ethers.utils.formatEther(blockReward))).to.equal(
        tokenBlockReward
      );
    });
  });

  describe("Transaction", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await sicoToken.transfer(addr1.address, 50);
      const addr1Balance = await sicoToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      await sicoToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await sicoToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await sicoToken.balanceOf(owner.address);
      await expect(
        sicoToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      expect(await sicoToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfer", async function () {
      const initialOwnerBalance = await sicoToken.balanceOf(owner.address);

      await sicoToken.transfer(addr1.address, 100);
      await sicoToken.transfer(addr2.address, 50);

      const finalOwnerBalance = await sicoToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

      const addr1Balance = await sicoToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await sicoToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});
