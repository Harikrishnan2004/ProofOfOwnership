# **Decentralized Proof of Ownership using Solidity**

## 📌 Overview

A blockchain-based system where users can register their work using smart contracts for **immutable proof of ownership**. It facilitates **copyright trading** through a **Proof of Stake (PoS)** mechanism, ensuring secure and transparent transactions. This system prevents ownership disputes and unauthorized claims by keeping records **decentralized and verifiable**.

---

## 🛠 Tech Stack

| Component         | Technology |
|------------------|------------|
| **Blockchain & Smart Contracts** | Solidity, Thirdweb |
| **Frontend** | React.js, Next.js |
| **Backend** | Thirdweb SDK |
| **Storage** | IPFS (for decentralized file storage) |

---

## ✨ Features

✅ **Immutable Proof of Ownership** – Users can register their digital assets securely.  
✅ **Decentralized Storage** – Uses **IPFS** and blockchain for **secure, tamper-proof** records.  
✅ **Smart Contract-Based Transfers** – Enables **copyright trading via PoS**.  
✅ **Transparent Transactions** – Ownership history is **publicly verifiable** on the blockchain.  
✅ **Secure Authentication** – Integrates **wallet-based login** for secure access.  

---

## 📂 Project Structure
```
📂 app/ (Frontend Application - Next.js & React.js)
│── components/Navbar.tsx        # Navigation bar component
│── constants/contracts.ts       # Stores smart contract addresses and ABI
│── dashboard/[account]/page.tsx # User dashboard to view assets and transactions
│── client.ts                    # Blockchain client setup for Thirdweb interactions
│── layout.tsx                    # Main layout file
│── page.tsx                      # Home page
│
📂 contracts/ (Solidity Smart Contracts)
│── ProofOfOwnership.sol          # Smart contract for registering and verifying ownership
│── ProofOfOwnershipFactory.sol   # Factory contract to manage multiple ownership contracts
│── PriceConvertor.sol            # Utility contract for handling token-based transactions
│
📂 public/ (Assets & Configs)
│── globals.css                   # Global styles
```

---

## ⚙️ Installation & Setup

### **🔹 Prerequisites**
Ensure you have the following installed:

- **Node.js** (Latest LTS version)  
- **Yarn** (or npm)  
- **Metamask Wallet** (for testing on blockchain)  
- **Thirdweb CLI**  

### **📥 Installation**
Clone this repository:

```bash
git clone https://github.com/yourusername/your-repo-name.git
```

Install dependencies:

```bash
yarn install
```

Deploy smart contracts using Thirdweb:

```bash
npx thirdweb deploy
```

Run the development server:

```bash
yarn dev
```

---

## 🚀 Usage

1️⃣ **Register Your Work** – Upload details and deploy to blockchain.  
2️⃣ **Verify Ownership** – Check asset ownership records **on-chain**.  
3️⃣ **Trade Copyrights** – Transfer ownership securely via **smart contracts**.  

---

## 🎯 Future Enhancements

🔹 **Multi-Chain Support** (Ethereum, Polygon, Solana)  
🔹 **Royalty Mechanism** for content creators  
🔹 **Decentralized Dispute Resolution** system  

---

