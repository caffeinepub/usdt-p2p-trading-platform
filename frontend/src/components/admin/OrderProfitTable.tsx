import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export interface OrderProfitRow {
  orderId: string;
  usdtAmount: number;
  inrAmount: number;
  profit: number;
  network: string;
  timestamp: string;
  status: string;
}

interface OrderProfitTableProps {
  orders: OrderProfitRow[];
  isLoading?: boolean;
}

export default function OrderProfitTable({ orders, isLoading }: OrderProfitTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 rounded bg-secondary/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No orders found for the selected filters.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-xs text-muted-foreground font-medium">Order ID</TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">USDT Amount</TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">INR Amount</TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">Profit</TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">Network</TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">Time</TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.orderId} className="border-border hover:bg-secondary/30">
              <TableCell className="font-mono text-xs text-amber-400">{order.orderId}</TableCell>
              <TableCell className="font-mono text-xs text-foreground">{order.usdtAmount.toFixed(4)}</TableCell>
              <TableCell className="font-mono text-xs text-foreground">₹{order.inrAmount.toLocaleString()}</TableCell>
              <TableCell className="font-mono text-xs text-success">+{order.profit.toFixed(4)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                  {order.network}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{order.timestamp}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/30">
                  {order.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
