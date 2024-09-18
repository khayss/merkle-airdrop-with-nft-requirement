import { MerkleTree } from "merkletreejs";
// import { createHash } from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import keccak256 from "keccak256";
import data from "../../data/eligible-packed.json";
import { abiCoder } from "./abi-encoder";
import { ethers } from "hardhat";

const merkleOutputFilePath = path.resolve(__dirname, "../../data/merkle.json");
const proofOutputFilePath = path.resolve(__dirname, "../../data/proof.json");

const leaves = data
  .sort((a: string, b: string) => a.localeCompare(b))
  .map((x: string) => keccak256(x));
const tree = new MerkleTree(leaves, keccak256, { sort: true });
const root = tree.getHexRoot();

// update the argument in leaf with the `address` + `amount` to generate a proof.
const claimAmount = ethers.parseUnits("262", 18);
const leaf = keccak256(
  abiCoder.encode(
    ["address", "uint256"],
    ["0x7eb413211a9DE1cd2FE8b8Bb6055636c43F7d206", claimAmount]
  )
);
const proof = tree.getHexProof(leaf);

const writeStream = fs.createWriteStream(merkleOutputFilePath);
writeStream.write(`{"root": "${root}"}\n`);
writeStream.close();

const writeStreamProof = fs.createWriteStream(proofOutputFilePath);
writeStreamProof.write(`{"proof": ${JSON.stringify(proof)}}\n`);
writeStreamProof.close();
