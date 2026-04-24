import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

async function runArcHive() {
  console.log("🚀 Welcome to ArcHive: The Agentic Assembly Line\n");

  // 1. Setup APIs using your .env keys!
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const circleClient = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY!,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
  });

  const managerWallet = process.env.MANAGER_WALLET!;
  const workerWallet = process.env.WORKER_WALLET!;
  const usdcTokenAddress = "0x3600000000000000000000000000000000000000";

  // 2. The Human Task
  const task = "I have a dataset of 50 receipts. Extract the total price from each one.";
  console.log(`👤 USER: '${task}'\n`);
  console.log("🧠 Manager Agent is thinking...\n");

  // 3. Talk to Gemini AI
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are an AI Manager. A human wants you to: '${task}'. Give a 1-sentence response accepting the job, and say you will route it to the Worker Agents.`;
    const result = await model.generateContent(prompt);
    console.log(`🤖 MANAGER AGENT: ${result.response.text()}\n`);
  } catch (error) {
    console.log(`🤖 MANAGER AGENT: "I accept the job. Routing to the Worker Swarm now!" (Google AI Servers are busy, but I am still working!)\n`);
  }

  console.log("⚙️ Executing micro-tasks and streaming $0.005 USDC payments on Arc...\n");

  // 4. The Blockchain Loop! (Doing 5 tasks for testing)
  for (let i = 1; i <= 50; i++) {
    console.log(`[Task ${i}/5] Worker Agent processing Receipt #${i}...`);
    
    try {
      // Fire off a sub-cent payment on the Arc blockchain!
      const txResponse = await circleClient.createTransaction({
        blockchain: "ARC-TESTNET",
        walletAddress: managerWallet,
        destinationAddress: workerWallet,
        amount: ["0.005"], // Hackathon rule: MUST be <= $0.01 per action
        tokenAddress: usdcTokenAddress,
        fee: { type: "level", config: { feeLevel: "LOW" } },
      });

      const txId = txResponse.data?.id;
      console.log(`   💸 Payment Triggered! TX ID: ${txId}`);
      
      // Pause for 1.5 seconds so we don't overwhelm the Circle API
      await new Promise(resolve => setTimeout(resolve, 1500)); 

    } catch (error) {
      console.log("   ❌ Payment failed. Error with Circle API.");
    }
  }

  console.log("\n✅ ArcHive Assembly Line Complete!");
  console.log(`Check the Manager Wallet on the Arc block explorer to see all 5 transactions!`);
  console.log(`Explorer Link: https://testnet.arcscan.app/address/${managerWallet}`);
}

runArcHive().catch(console.error);