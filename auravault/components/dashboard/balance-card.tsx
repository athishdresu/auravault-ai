"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  title: string;
  amount: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: "wallet" | "savings" | "credit";
}

const icons = {
  wallet: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
};

export function BalanceCard({
  title,
  amount,
  change,
  changeType,
  icon,
}: BalanceCardProps) {
  const Icon = icons[icon];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-card-foreground">{amount}</div>
        <div className="flex items-center gap-1 mt-2">
          {changeType === "positive" ? (
            <TrendingUp className="w-4 h-4 text-primary" />
          ) : changeType === "negative" ? (
            <TrendingDown className="w-4 h-4 text-destructive" />
          ) : null}
          <span
            className={cn(
              "text-sm font-medium",
              changeType === "positive"
                ? "text-primary"
                : changeType === "negative"
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {change}
          </span>
          
          {/* The Condition */}
          {change !== "Dynamic Limit" && (
            <span className="text-sm text-muted-foreground">vs last month</span>
          )}
          
        </div>
      </CardContent>
    </Card>
  );
}