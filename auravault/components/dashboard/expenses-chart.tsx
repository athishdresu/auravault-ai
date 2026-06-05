"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  transactions?: any[];
}

export function ExpensesChart({ transactions = [] }: Props) {
  const chartData = useMemo(() => {
    const monthlyTotals: Record<string, number> = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
      Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
    };
    const currentMonth = new Date().toLocaleString('en-US', { month: 'short' });

    transactions.forEach((tx) => {
      const category = (tx.category || "").toLowerCase();
      if (category !== "salary" && category !== "income" && category !== "savings") {
        let monthToLog = currentMonth;

        if (tx.date) {
          const parsedDate = new Date(tx.date);
          if (!isNaN(parsedDate.getTime())) {
            monthToLog = parsedDate.toLocaleString('en-US', { month: 'short' });
          }
        }

        monthlyTotals[monthToLog] += Math.abs(parseFloat(tx.amount) || 0);
      }
    });

    return Object.keys(monthlyTotals).map((month) => ({
      month,
      expenses: monthlyTotals[month],
    }));
  }, [transactions]);

  return (
    <Card className="bg-card border-border col-span-2 h-full">
      <CardHeader>
        <CardTitle className="text-card-foreground">Monthly Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              wrapperStyle={{ zIndex: 1000 }}
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
              }}
              labelStyle={{ color: "#ffffff", fontWeight: 600, marginBottom: "4px" }}
              itemStyle={{ color: "#ffffff" }}
              formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, "Expenses"]}
            />
            <Bar
              dataKey="expenses"
              fill="#00E5CC"
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
              animationBegin={0}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}