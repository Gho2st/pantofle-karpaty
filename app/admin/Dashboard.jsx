"use client";
import { useEffect, useState } from "react";
import { TrendingUp, ShoppingBag, Users, BarChart2 } from "lucide-react";

function fmt(value) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(value);
}

function monthLabel(key) {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("pl-PL", { month: "short", year: "2-digit" });
}

function StatCard({ icon, label, value, sub, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex gap-4 items-start">
      <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5 truncate">
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex items-end gap-2 h-40 w-full">
      {data.map((d) => {
        const pct = Math.round((d.revenue / max) * 100);
        return (
          <div
            key={d.month}
            className="flex flex-col items-center flex-1 gap-1"
          >
            <span className="text-[10px] text-gray-500 font-medium">
              {fmt(d.revenue)}
            </span>
            <div
              className="w-full flex items-end justify-center"
              style={{ height: "90px" }}
            >
              <div
                className="w-full rounded-t-md bg-blue-500 transition-all duration-500"
                style={{
                  height: `${pct}%`,
                  minHeight: d.revenue > 0 ? "4px" : "0",
                }}
              />
            </div>
            <span className="text-[10px] text-gray-400">
              {monthLabel(d.month)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Błąd pobierania danych");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Ładowanie statystyk…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">
        {error}
      </div>
    );
  }

  const { revenue, orders, users, topProducts, monthlyRevenue } = data;

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Główne KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingUp size={22} />}
          label="Przychód całkowity (netto dostawa)"
          value={fmt(revenue.total)}
          sub={`Brutto: ${fmt(revenue.totalGross)}`}
          color="green"
        />
        <StatCard
          icon={<ShoppingBag size={22} />}
          label="Zamówienia opłacone"
          value={orders.total}
          sub={`Dziś: ${orders.today} · Ten miesiąc: ${orders.thisMonth}`}
          color="blue"
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="Przychód w tym miesiącu"
          value={fmt(revenue.thisMonth)}
          sub={`Dziś: ${fmt(revenue.today)}`}
          color="purple"
        />
        <StatCard
          icon={<Users size={22} />}
          label="Użytkownicy"
          value={users.total}
          sub={`Nowi w tym miesiącu: ${users.newThisMonth}`}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Wykres miesięczny */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={18} className="text-blue-500" />
            <h2 className="font-semibold text-gray-700">
              Przychody — ostatnie 6 miesięcy
            </h2>
          </div>
          <BarChart data={monthlyRevenue} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-center gap-6">
          <div>
            <p className="text-sm text-gray-500">Średnia wartość zamówienia</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {fmt(revenue.avgOrder)}
            </p>
          </div>
        </div>
      </div>

      {/* Top produkty + średnia */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-4">
            Top 5 produktów (ilość)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b">
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Produkt</th>
                  <th className="pb-2 font-medium text-right">
                    Sprzedano (szt.)
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-400">
                      Brak danych
                    </td>
                  </tr>
                )}
                {topProducts.map((p, i) => (
                  <tr key={p.name} className="border-b last:border-0">
                    <td className="py-2 text-gray-400 w-6">{i + 1}</td>
                    <td className="py-2 text-gray-700 font-medium">{p.name}</td>
                    <td className="py-2 text-right text-gray-800 font-bold">
                      {p._sum.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
