import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const circleClient = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});

const managerWallet = process.env.MANAGER_WALLET!;
const workerWallet = process.env.WORKER_WALLET!;
const usdcTokenAddress = "0x3600000000000000000000000000000000000000";

app.get("/api/start", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendLog = (msg: string) => res.write(`data: ${msg}\n\n`);

  // 👇 GRAB THE PROMPT FROM THE WEBSITE TEXT BOX 👇
  const task = (req.query.task as string) || "I have a dataset of 50 receipts. Extract the total price from each one.";

  sendLog("🚀 Starting ArcHive...");
  sendLog(`👤 USER: '${task}'`);
  sendLog("🧠 Manager Agent is thinking...");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(`You are an AI. A human says: '${task}'. Give a 1-sentence response accepting the job, and say you will route it to the Worker Swarm.`);
    sendLog(`🤖 MANAGER AGENT: ${result.response.text()}`);
  } catch (error) {
    sendLog(`🤖 MANAGER AGENT: "I accept the job. Routing to the Worker Swarm now!"`);
  }

  sendLog("⚙️ Executing micro-tasks and streaming $0.005 USDC payments on Arc...");

  // LOOPING 50 TIMES!
  for (let i = 1; i <= 50; i++) {
    sendLog(`[Task ${i}/50] Worker Agent processing task...`);
    
    try {
      const txResponse = await circleClient.createTransaction({
        blockchain: "ARC-TESTNET",
        walletAddress: managerWallet,
        destinationAddress: workerWallet,
        amount: ["0.005"],
        tokenAddress: usdcTokenAddress,
        fee: { type: "level", config: { feeLevel: "LOW" } },
      });
      sendLog(`   💸 Payment Triggered! TX ID: ${txResponse.data?.id}`);
      await new Promise(resolve => setTimeout(resolve, 1500)); 
    } catch (error) {
      sendLog("   ❌ Payment failed. Waiting...");
    }
  }

  sendLog(`✅ ArcHive Assembly Line Complete!`);
  sendLog(`🔗 View Explorer: <a href='https://testnet.arcscan.app/address/${managerWallet}' target='_blank' style='color:#58a6ff'>Click here to verify on Blockchain</a>`);
  res.end();
});

app.listen(PORT, () => {
  console.log(`🚀 WEB DASHBOARD IS LIVE AT: http://localhost:3000`);
});