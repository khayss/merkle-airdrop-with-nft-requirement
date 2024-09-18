import { ethers } from "hardhat";
import { MERKLE_AIRDROP_ADDRESS, TOKEN_ADDRESS } from "../configs/config";
import proof from "../data/proof.json";

async function main() {
  const MerkleAirdrop = await ethers.getContractAt(
    "MerkleAirdrop",
    MERKLE_AIRDROP_ADDRESS
  );
  const Token = await ethers.getContractAt("IERC20", TOKEN_ADDRESS);

  const isVerified = await MerkleAirdrop.verifyProof(
    proof.proof,
    "0xDaB8892C07FB4C362Dd99D9a2fBFf8B555D39Cb5",
    68
  );
  console.log("Address and amount is verified:", isVerified);

  const transferTx = await Token.transfer(
    MERKLE_AIRDROP_ADDRESS,
    BigInt(1000 * 10 ** 18)
  );
  transferTx.wait();
  console.log("Transfered to Merkle Airdrop contract::", transferTx.hash);

  const startAirdropTx = await MerkleAirdrop.startAirdrop();
  startAirdropTx.wait();
  console.log("Airdrop started:", startAirdropTx.hash);

  const claimTx = await MerkleAirdrop.claimAirdrop(proof.proof, 68);
  claimTx.wait();
  console.log("Claimed:", claimTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
