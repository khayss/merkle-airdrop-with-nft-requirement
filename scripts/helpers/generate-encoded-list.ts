import * as csv from "fast-csv";
import fs from "node:fs";
import path from "node:path";
import { abiCoder } from "./abi-encoder";
import { ethers } from "hardhat";

const listPath = path.resolve(__dirname, "../../data/eligible-packed.json");
const listWS = fs.createWriteStream(listPath);
const csvPath = path.resolve(__dirname, "../../data/eligible.csv");

function getEligibleList(filePath: string) {
  const data: string[] = [];

  fs.createReadStream(filePath)
    .pipe(csv.parse({ headers: true }))
    .on("error", (error: unknown) => {
      console.error(error);
      process.exit(1);
    })
    .on("data", (row: { address: string; amount: string }) => {
      const parsedAmount = ethers.parseUnits(row.amount, 18);
      data.push(
        abiCoder.encode(["address", "uint256"], [row.address, parsedAmount])
      );
    })

    .on("end", (rowCount: number) => {
      listWS.write(JSON.stringify(data));
      listWS.close();
    });
}

getEligibleList(csvPath);
