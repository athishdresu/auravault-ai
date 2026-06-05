"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export function TransactionsList({ transactions = [], onRefresh }: { transactions?: any[], onRefresh?: () => void }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to delete transaction", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-sidebar rounded-xl border border-sidebar-border overflow-hidden h-full shadow-sm">
      <div className="p-6 border-b border-sidebar-border bg-sidebar-accent/30">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
      </div>
      <div className="divide-y divide-sidebar-border">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No recent data.
          </div>
        ) : (
          transactions.slice(0, 5).map((tx) => {
            const isIncome = (tx.category || "").toLowerCase() === "salary" || (tx.category || "").toLowerCase() === "income";
            
            return (
              <div 
                key={tx.id} 
                className="p-5 flex items-center justify-between hover:bg-sidebar-accent/50 transition-colors group"
              >
                <div>
                  <p className="font-medium text-foreground">{tx.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tx.date} • {tx.category}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${isIncome ? "text-emerald-500" : "text-foreground"}`}>
                    {isIncome ? "+" : ""}
                    ₹{parseFloat(tx.amount || 0).toLocaleString("en-IN")}
                  </span>
                  
                  {/* The Delete Button */}
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deletingId === tx.id}
                    className="p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-100"
                    title="Delete transaction"
                  >
                    {deletingId === tx.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}