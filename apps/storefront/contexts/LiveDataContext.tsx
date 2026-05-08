"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase-client";
import { getTenant } from "@/lib/tenant";

export type LiveProduct = {
  id: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  in_stock: boolean;
  stock_qty: number | null;
};

type LiveDataMap = Map<string, LiveProduct>;

const LiveDataContext = createContext<LiveDataMap>(new Map());

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LiveDataMap>(new Map());

  useEffect(() => {
    if (!supabase) return;
    const tenant = getTenant();
    const query = supabase
      .from("ecom_products")
      .select("id, slug, price, compare_at_price, in_stock, stock_qty");

    (tenant.companyId
      ? query.eq("company_id", tenant.companyId)
      : query.eq("is_active", true)
    ).then(({ data: rows, error }) => {
      if (error || !rows) return;
      const map = new Map<string, LiveProduct>();
      rows.forEach((row: LiveProduct) => map.set(row.slug, row));
      setData(map);
    });
  }, []);

  return (
    <LiveDataContext.Provider value={data}>
      {children}
    </LiveDataContext.Provider>
  );
}

export function useLiveData(): LiveDataMap {
  return useContext(LiveDataContext);
}
