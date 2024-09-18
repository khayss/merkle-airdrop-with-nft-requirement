import { ethers } from "hardhat";
import { config } from "../configs/config";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Airdrop", () => {
  async function deployAirdrop() {
    const [account1, others] = await ethers.getSigners();
    const impersonatedAccount1 = await ethers.getImpersonatedSigner(
      config.BAYC_HOLDER
    );

    const baycNft = await ethers.getContractAt("IERC721", config.BAYC_ADDRESS);

    const tx = await account1.sendTransaction({
      to: config.BAYC_HOLDER,
      value: ethers.parseUnits("1", 18),
    });

    const Airdrop = await ethers.getContractFactory("Airdrop");
    const Token = await ethers.getContractFactory("MyToken");

    const token = await Token.deploy(account1.address);
    const tokenAddress = await token.getAddress();

    const airdrop = await Airdrop.deploy(
      account1.address,
      tokenAddress,
      config.MERKLE_ROOT
    );

    const airdropAmount = ethers.parseUnits("100000", 18);
    await token.transfer(await airdrop.getAddress(), airdropAmount);

    return { airdrop, token, account1, others, impersonatedAccount1, baycNft };
  }

  describe("Deployment", () => {
    it("Should set the right owner, token, and merkle root", async () => {
      const { airdrop, account1, token } = await loadFixture(deployAirdrop);

      expect(await airdrop.owner()).to.equal(account1.address);
      expect(await airdrop.getToken()).to.equal(await token.getAddress());
      expect(await airdrop.getMerkleRoot()).to.equal(config.MERKLE_ROOT);
    });

    it("should deploy as inactive", async () => {
      const { airdrop } = await loadFixture(deployAirdrop);

      expect(await airdrop.getStatus()).to.equal(false);
    });
    it("should set the right bayc address", async () => {
      const { airdrop } = await loadFixture(deployAirdrop);

      expect(await airdrop.getBaycAddress()).to.equal(config.BAYC_ADDRESS);
    });
  });

  describe("Airdrop", () => {
    it("should start and end airdrop", async () => {
      const { airdrop } = await loadFixture(deployAirdrop);

      await airdrop.startAirdrop();
      expect(await airdrop.getStatus()).to.equal(true);

      await airdrop.endAirdrop();
      expect(await airdrop.getStatus()).to.equal(false);
    });

    it("should claim tokens", async () => {
      const claimAmount = ethers.parseUnits(
        config.BAYC_HOLDER_CLAIM_AMOUNT.toString(),
        18
      );
      const { airdrop, account1, others, token, impersonatedAccount1 } =
        await loadFixture(deployAirdrop);

      await airdrop.startAirdrop();

      const balBefore = await token.balanceOf(config.BAYC_HOLDER);

      await airdrop
        .connect(impersonatedAccount1)
        .claimAirdrop(claimAmount, config.BAYC_HOLDER_AIRDROP_PROOF);

      const balAfter = await token.balanceOf(config.BAYC_HOLDER);

      expect(balAfter).to.equal(balBefore + claimAmount);
    });
  });
});
