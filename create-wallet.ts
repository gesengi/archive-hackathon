import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import {
  registerEntitySecretCiphertext,
  initiateDeveloperControlledWalletsClient
} from "@circle-fin/developer-controlled-wallets";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "output");
const WALLET_SET_NAME = "ArcHive Agent Wallets";

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    throw new Error("CIRCLE_API_KEY is required in your .env file!");
  }

  console.log("Registering Entity Secret...");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const entitySecret = crypto.randomBytes(32).toString("hex");
  await registerEntitySecretCiphertext({
    apiKey,
    entitySecret,
    recoveryFileDownloadPath: OUTPUT_DIR,
  });
  
  const envPath = path.join(__dirname, ".env");
  fs.appendFileSync(envPath, `\nCIRCLE_ENTITY_SECRET=${entitySecret}\n`, "utf-8");
  console.log("Entity Secret registered.");

  console.log("\nCreating Wallet Set...");
  const client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
  const walletSet = (await client.createWalletSet({ name: WALLET_SET_NAME })).data?.walletSet;
  
  console.log("\nCreating Manager Wallet on ARC-TESTNET...");
  const wallet = (
    await client.createWallets({
      walletSetId: walletSet!.id,
      blockchains: ["ARC-TESTNET"],
      count: 1,
      accountType: "EOA",
    })
  ).data?.wallets?.[0];
  
  console.log("Manager Wallet Address:", wallet?.address);
  fs.appendFileSync(envPath, `MANAGER_WALLET=${wallet?.address}\n`, "utf-8");

  console.log("\n*** STOP AND DO THIS ***");
  console.log("1. Go to https://faucet.circle.com");
  console.log('2. Select "Arc Testnet"');
  console.log(`3. Paste this address: ${wallet?.address}`);
  console.log('4. Click "Send USDC"');
  
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise<void>((resolve) =>
    rl.question("\nPress Enter ONLY AFTER the faucet says the tokens were sent... ", () => {
      rl.close();
      resolve();
    }),
  );

  console.log("\nCreating Worker Wallet...");
  const secondWallet = (
    await client.createWallets({
      walletSetId: walletSet!.id,
      blockchains:["ARC-TESTNET"],
      count: 1,
      accountType: "EOA",
    })
  ).data?.wallets?.[0];
  
  console.log("Worker Wallet Address:", secondWallet?.address);
  fs.appendFileSync(envPath, `WORKER_WALLET=${secondWallet?.address}\n`, "utf-8");

  const ARC_TESTNET_USDC = "0x3600000000000000000000000000000000000000";
  console.log("\nSending $5 USDC to the Worker Agent to test the Arc Blockchain...");
  
  const txResponse = await client.createTransaction({
    blockchain: "ARC-TESTNET",
    walletAddress: wallet!.address,
    destinationAddress: secondWallet!.address,
    amount: ["5"],
    tokenAddress: ARC_TESTNET_USDC,
    fee: { type: "level", config: { feeLevel: "MEDIUM" } },
  });
  
  const txId = txResponse.data?.id;
  console.log("Transaction ID:", txId);

  const terminalStates = new Set(["COMPLETE", "FAILED", "CANCELLED", "DENIED"]);
  let currentState: string | undefined = txResponse.data?.state;
  let txHash: string | undefined = undefined;

  while (!currentState || !terminalStates.has(currentState)) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const poll = await client.getTransaction({ id: txId! });
    currentState = poll.data?.transaction?.state;
    txHash = poll.data?.transaction?.txHash;
    console.log("Transaction state:", currentState);
  }

  if (currentState === "COMPLETE") {
    console.log("\n✅ SUCCESS! You just sent USDC on the Arc Blockchain!");
    console.log(`View on Explorer: https://testnet.arcscan.app/tx/${txHash}`);
  } else {
    console.log(`\n⚠️ Transaction finished with state: ${currentState}`);
  }
}

main().catch(console.error);