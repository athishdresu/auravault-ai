"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs"; // 1. Added Clerk import
import { Upload, Loader2 } from "lucide-react";

export function TransactionsView() {
  const { user, isLoaded } = useUser(); // 2. Grab the user data
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 3. Wait until Clerk has loaded the user before fetching!
    if (!isLoaded || !user?.id) return;

    // 4. Pass the userId to the backend!
    fetch(`http://localhost:5000/api/transactions?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Backend Error! Expected an array but got:", data);
          setTransactions([]); 
          setLoading(false);
          return;
        }

        const sortedData = data.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sortedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch from backend:", error);
        setLoading(false);
      });
  // 5. Add user?.id to the dependency array so it refetches if the user changes
  }, [isLoaded, user?.id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      /* 🚀 NEXT STEP FOR HACKATHON:
        We will uncomment this and build the /api/upload route in Python
        to run OCR / Gemini vision on the document!
        
        const response = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
      */
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("File ready for AI extraction:", file.name);
      
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  return (
    <div className="w-full space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">All Transactions</h2>
        
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.csv,.png,.jpg"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{isUploading ? "AI Processing..." : "Upload Statement"}</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse border border-sidebar-border rounded-lg bg-sidebar">
          Syncing full ledger with AuraVault Secure Servers...
        </div>
      ) : (
        <div className="bg-sidebar rounded-lg border border-sidebar-border overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No transactions found in database.
            </div>
          ) : (
            transactions.map((tx: any) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between p-5 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors last:border-0"
              >
                <div>
                  <p className="font-bold text-foreground text-lg">{tx.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tx.date} • {tx.category}
                  </p>
                </div>
                
                <span className={`text-lg font-bold ${
                    (tx.category || "").toLowerCase() === 'salary' || (tx.category || "").toLowerCase() === 'income' 
                    ? "text-emerald-500" 
                    : "text-foreground"
                }`}>
                  {(tx.category || "").toLowerCase() === 'salary' || (tx.category || "").toLowerCase() === 'income' ? '+' : ''}
                  ₹{parseFloat(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}