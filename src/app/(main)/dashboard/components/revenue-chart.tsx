
'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Contract } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface RevenueChartProps {
  contracts: Contract[];
}

export function RevenueChart({ contracts }: RevenueChartProps) {
  const monthlyRevenue = contracts
    .filter((contract) => contract.status === 'paid' && contract.paymentDate)
    .reduce((acc, contract) => {
      const month = new Date(contract.paymentDate!).toLocaleString('pt-BR', {
        month: 'short',
      });
      acc[month] = (acc[month] || 0) + contract.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.keys(monthlyRevenue).map((month) => ({
    name: month,
    total: monthlyRevenue[month],
  }));

  const chartConfig = {
    total: {
      label: 'Receita',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
      >
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${Number(value) / 1000}k`}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent 
            indicator="dot" 
            formatter={(value) => typeof value === 'number' ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : value}
           />}
        />
        <Bar dataKey="total" fill="var(--color-total)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
