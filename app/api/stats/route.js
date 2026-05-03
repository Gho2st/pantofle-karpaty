import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 403 });
  }

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOf6MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    allPaidOrders,
    todayOrders,
    thisMonthOrders,
    totalUsers,
    newUsersThisMonth,
    topProducts,
    monthlyRaw,
  ] = await Promise.all([
    // Wszystkie opłacone zamówienia (PAID + SHIPPED)
    prisma.order.findMany({
      where: { status: { in: ["PAID", "SHIPPED"] } },
      select: { totalAmount: true, discountAmount: true, deliveryCost: true },
    }),

    // Dzisiaj
    prisma.order.findMany({
      where: {
        status: { in: ["PAID", "SHIPPED"] },
        createdAt: { gte: startOfToday },
      },
      select: { totalAmount: true },
    }),

    // Ten miesiąc
    prisma.order.findMany({
      where: {
        status: { in: ["PAID", "SHIPPED"] },
        createdAt: { gte: startOfMonth },
      },
      select: { totalAmount: true },
    }),

    // Łączna liczba użytkowników
    prisma.user.count(),

    // Nowi użytkownicy w tym miesiącu
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),

    // Top 5 produktów wg sprzedanej ilości (PAID + SHIPPED)
    prisma.orderItem.groupBy({
      by: ["name"],
      where: {
        order: { status: { in: ["PAID", "SHIPPED"] } },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),

    // Przychody miesięczne (ostatnie 6 miesięcy)
    prisma.order.findMany({
      where: {
        status: { in: ["PAID", "SHIPPED"] },
        createdAt: { gte: startOf6MonthsAgo },
      },
      select: { totalAmount: true, createdAt: true },
    }),
  ]);

  // Przychód całkowity (bez kosztów dostawy, bez rabatów)
  const totalRevenue = allPaidOrders.reduce(
    (sum, o) => sum + o.totalAmount - o.deliveryCost,
    0,
  );
  const totalRevenueGross = allPaidOrders.reduce(
    (sum, o) => sum + o.totalAmount,
    0,
  );
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const monthRevenue = thisMonthOrders.reduce(
    (sum, o) => sum + o.totalAmount,
    0,
  );
  const avgOrderValue =
    allPaidOrders.length > 0 ? totalRevenueGross / allPaidOrders.length : 0;

  // Przychody miesięczne — grupujemy po miesiącu
  const monthlyMap = {};
  for (const order of monthlyRaw) {
    const key = `${order.createdAt.getFullYear()}-${String(
      order.createdAt.getMonth() + 1,
    ).padStart(2, "0")}`;
    monthlyMap[key] = (monthlyMap[key] ?? 0) + order.totalAmount;
  }

  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyRevenue.push({ month: key, revenue: monthlyMap[key] ?? 0 });
  }

  return NextResponse.json({
    revenue: {
      total: totalRevenue,
      totalGross: totalRevenueGross,
      today: todayRevenue,
      thisMonth: monthRevenue,
      avgOrder: avgOrderValue,
    },
    orders: {
      total: allPaidOrders.length,
      today: todayOrders.length,
      thisMonth: thisMonthOrders.length,
    },
    users: {
      total: totalUsers,
      newThisMonth: newUsersThisMonth,
    },
    topProducts,
    monthlyRevenue,
  });
}
