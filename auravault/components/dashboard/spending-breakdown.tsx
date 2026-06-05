"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Utensils, 
  Home, 
  Zap, 
  Smartphone, 
  TrendingUp, 
  CreditCard,
  Car,
  Coffee
} from "lucide-react";

interface Props {
  transactions?: any[];
}

function getCategoryStyles(categoryName: string) {
  const name = categoryName.toLowerCase();
  if (name.includes("shop") || name.includes("retail")) return { icon: <ShoppingBag className="w-4 h-4" />, color: "bg-blue-500" };
  if (name.includes("food") || name.includes("din") || name.includes("restaurant")) return { icon: <Utensils className="w-4 h-4" />, color: "bg-orange-500" };
  if (name.includes("coffee") || name.includes("cafe")) return { icon: <Coffee className="w-4 h-4" />, color: "bg-amber-700" };
  if (name.includes("house") || name.includes("rent") || name.includes("home")) return { icon: <Home className="w-4 h-4" />, color: "bg-purple-500" };
  if (name.includes("util") || name.includes("electric") || name.includes("bill")) return { icon: <Zap className="w-4 h-4" />, color: "bg-yellow-500" };
  if (name.includes("sub") || name.includes("tech") || name.includes("phone")) return { icon: <Smartphone className="w-4 h-4" />, color: "bg-pink-500" };
  if (name.includes("transit") || name.includes("travel") || name.includes("gas") || name.includes("car")) return { icon: <Car className="w-4 h-4" />, color: "bg-teal-500" };

  return { icon: <CreditCard className="w-4 h-4" />, color: "bg-emerald-500" };
}

export function SpendingBreakdown({ transactions = [] }: Props) {

  const { categories, totalSpent } = useMemo(() => {
    let total = 0;
    const categoryMap: Record<string, number> = {};

    transactions.forEach((tx) => {
      const cat = (tx.category || "Other").trim();
      const catLower = cat.toLowerCase();
      if (catLower === 'salary' || catLower === 'income' || catLower === 'savings') return;

      const amt = Math.abs(parseFloat(tx.amount) || 0);
      total += amt;
      categoryMap[cat] = (categoryMap[cat] || 0) + amt;
    });

    const mappedCategories = Object.keys(categoryMap).map((name) => {
      const amount = categoryMap[name];
      const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
      const { icon, color } = getCategoryStyles(name);
      
      return { name, amount, percentage, icon, color };
    });

    mappedCategories.sort((a, b) => b.amount - a.amount);
    return { categories: mappedCategories, totalSpent: total };
  }, [transactions]);

  return (
    <Card className="p-6 border border-border">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-semibold text-foreground">Live Spending Breakdown</h3>
        </div>
        <p className="text-sm text-muted-foreground">Your spending by category</p>
      </div>

      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No spending data logged yet.
          </div>
        ) : (
          categories.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                    {category.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{category.name}</p>
                    <p className="text-xs text-muted-foreground">₹{category.amount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-emerald-500">{category.percentage}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full ${category.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Total Spent</p>
          <p className="text-lg font-bold text-emerald-500">₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
    </Card>
  );
}