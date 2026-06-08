"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Loader2, Trash2 } from "lucide-react";

export function TransactionsView() {
  const MOCK_USER_ID = "hackathon_admin";
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTransactions = () => {
    fetch(`https://auravault-ai.onrender.com/api/transactions?userId=${MOCK_USER_ID}`)
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
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", MOCK_USER_ID);
    
    try {
      const response = await fetch("https://auravault-ai.onrender.com/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Upload failed");
      
      const result = await response.json();
      fetchTransactions();
      window.dispatchEvent(new Event("searchTransactions"));
      window.dispatchEvent(new Event("notificationsUpdated"));
      
      alert(`Success! AuraVault AI extracted ${result.count} transactions.`);
      
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to process statement. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("WARNING: Are you sure you want to permanently delete ALL transactions? This cannot be undone!")) return;

    try {
      await fetch(`https://auravault-ai.onrender.com/api/transactions/all?userId=${MOCK_USER_ID}`, {
        method: "DELETE",
      });
      
      setTransactions([]);
      
      window.dispatchEvent(new Event("searchTransactions"));
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (error) {
      console.error("Failed to clear vault:", error);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await fetch(`https://auravault-ai.onrender.com/api/transactions/${id}`, {
        method: "DELETE",
      });
      fetchTransactions();
      window.dispatchEvent(new Event("searchTransactions"));
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (error) {
      console.error("Failed to delete transaction", error);
    }
  };

  return (
    <div className="w-full space-y-4 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">All Transactions</h2>
        
        <div className="flex items-center gap-3">
          {transactions.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete All</span>
            </button>
          )}

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
            <span>{isUploading ? "Uploading..." : "Upload Statement"}</span>
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
                className="flex items-center justify-between p-5 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors last:border-0 group"
              >
                <div>
                  <p className="font-bold text-foreground text-lg">{tx.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tx.date} • {tx.category}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-bold ${
                      (tx.category || "").toLowerCase() === 'salary' || (tx.category || "").toLowerCase() === 'income' 
                      ? "text-emerald-500" 
                      : "text-foreground"
                  }`}>
                    {(tx.category || "").toLowerCase() === 'salary' || (tx.category || "").toLowerCase() === 'income' ? '+' : ''}
                    ₹{parseFloat(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>

                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
