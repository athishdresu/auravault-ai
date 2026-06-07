# AuraVault AI 🛡️

AuraVault AI is a modern, full-stack wealth management platform. It combines a beautiful, responsive Next.js dashboard with a powerful Python backend to track spending, analyze financial health, and automate transaction entry using Google's Gemini Vision AI.

 Live Demo: https://auravault-ai.vercel.app/

## Key Features
* **Automated Data Entry:** Upload receipts or statements and let Gemini 1.5 Flash Vision automatically extract and categorize transactions.
* **Elite AI Advisor:** Chat with a context-aware financial AI that understands your exact liquidity, burn rate, and spending habits.
* **Real-time Cloud Ledger:** High-speed database syncing backed by AWS DynamoDB.
* **Bank-Grade Security:** User authentication and route protection powered by Clerk.
* **Responsive Dark UI:** Beautifully crafted with Tailwind CSS, perfectly optimized for both desktop and mobile screens.

## Tech Stack
**Frontend:**
* Next.js (React)
* Tailwind CSS + Lucide Icons
* Clerk (Authentication)
* Vercel (Hosting)

**Backend & Cloud:**
* Python + Flask API
* AWS DynamoDB
* Google Gemini 3.5 Flash (LLM & Vision)
* Render (Hosting)

##  Getting Started (Local Development)

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/auravault-ai.git
cd auravault-ai
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
# or
pnpm install
\`\`\`

### 3. Set up Environment Variables
Create a `.env.local` file in the root directory and add your Clerk keys:
\`\`\`env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
\`\`\`

### 4. Run the Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

*(Note: To run the full application locally, you must also clone and run the Python backend API on port 5000).*

---
*Built with proud for [H0: Hack the Zero Stack with Vercel v0 and AWS Databases]*
