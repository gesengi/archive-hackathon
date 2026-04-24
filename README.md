# 🚀 ArcHive: The Agentic Assembly Line
**Built for the Agentic Economy on Arc Hackathon**

ArcHive is an autonomous Agentic Assembly Line where AI managers route tasks to specialized worker agents, paying them strictly per-action ($0.005) in real-time using gas-free Circle Nanopayments on the Arc Testnet.

## ⚠️ The Margin Explanation (Why Arc?)
If an AI agent needs to pay a specialized sub-agent exactly $0.005 for a micro-task (like extracting text from one receipt), using a standard Ethereum L2 with a conservative $0.05 gas fee would result in a **-1,000% profit margin**. Machine-to-machine micro-commerce fails under traditional gas costs. 

ArcHive utilizes the **Arc EVM Layer-1**. Instead of batching payments or using custodians, ArcHive uses Circle Developer-Controlled Wallets to stream exactly $0.005 USDC to Worker Agents for every single task completed in real-time, with zero gas overhead.

## 🛠️ Technology Stack
* **Blockchain:** Arc Testnet L1
* **Payments:** Circle Developer-Controlled Wallets (Node.js SDK)
* **AI Engine:** Google Gemini 2.5 Flash
* **Frontend:** Express.js & SSE (Server-Sent Events)

## ⚙️ How it Works
1. A user submits a large dataset request (e.g., "Extract totals from 50 receipts").
2. **Gemini 2.5 Flash** acts as the Manager Agent, reasoning about the task and accepting the job.
3. The Manager Agent routes the 50 micro-tasks to the Worker Swarm.
4. For every task completed, the Manager's Circle Wallet triggers an instant on-chain transaction of $0.005 USDC to the Worker's Wallet.

## 🚀 How to Run Locally
1. Clone the repository.
2. Run `npm install`
3. Add your `.env` file with `CIRCLE_API_KEY`, `CIRCLE_ENTITY_SECRET`, `GEMINI_API_KEY`, `MANAGER_WALLET`, and `WORKER_WALLET`.
4. Run `npx tsx server.ts` and navigate to `http://localhost:3000`.
