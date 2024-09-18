import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";

let inputs = ["a", "b", "c", "d"].map((x) => keccak256(x));
let tree = new MerkleTree(inputs, keccak256, { sort: true });
let root = tree.getHexRoot();
let leaf = keccak256("a");
let proof = tree.getHexProof(leaf);

console.log("root", root);
console.log("proof", proof);
