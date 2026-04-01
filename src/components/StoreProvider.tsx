import { useState, useCallback, useMemo, type ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast as sonnerToast } from "sonner";
import {
  StoreContext,
  MOCK_VEHICLES,
  MOCK_EXPENSES,
  MOCK_APPRAISALS,
  MOCK_MARKETPLACE,
  DEFAULT_CATEGORIES,
  uid,
  mapConvexVehicleToLocal,
  mapConvexExpenseToLocal,
  mapConvexAppraisalToLocal,
  type Vehicle,
  type Expense,
  type Appraisal,
  type MarketplaceListing,
  type MarketplaceOffer,
  type VehicleCategory,
  type StoreState,
} from "@/lib/store";

const CATEGORY_COLORS = ["#3dd45c", "#f59e0b", "#3b82f6", "#a855f7", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

/* ------------------------------------------------------------------ */
/*  Cloud-backed provider (used when VITE_CONVEX_URL is set)          */
/* ------------------------------------------------------------------ */
function CloudStoreProvider({ children }: { children: ReactNode }) {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const isAuthenticated = !!currentUser;

  const cvVehicles = useQuery(api.queries.listVehicles, isAuthenticated ? {} : "skip");
  const cvExpenses = useQuery(api.queries.listExpenses, isAuthenticated ? {} : "skip");
  const cvAppraisals = useQuery(api.queries.listAppraisals, isAuthenticated ? {} : "skip");

  const createVehicleMut = useMutation(api.mutations.createVehicle);
  const updateVehicleMut = useMutation(api.mutations.updateVehicle);
  const deleteVehicleMut = useMutation(api.mutations.deleteVehicle);
  const createExpenseMut = useMutation(api.mutations.createExpense);
  const deleteExpenseMut = useMutation(api.mutations.deleteExpense);
  const createAppraisalMut = useMutation(api.mutations.createAppraisal);

  const [localVehicles, setLocalVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [localExpenses, setLocalExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [localAppraisals, setLocalAppraisals] = useState<Appraisal[]>(MOCK_APPRAISALS);
  const [marketplace, setMarketplace] = useState<MarketplaceListing[]>(MOCK_MARKETPLACE);
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>(DEFAULT_CATEGORIES);

  const vehicles: Vehicle[] = useMemo(() => {
    if (isAuthenticated && cvVehicles) return cvVehicles.map(mapConvexVehicleToLocal);
    if (isAuthenticated) return [];
    return localVehicles;
  }, [isAuthenticated, cvVehicles, localVehicles]);

  const expenses: Expense[] = useMemo(() => {
    if (isAuthenticated && cvExpenses) return cvExpenses.map(mapConvexExpenseToLocal);
    if (isAuthenticated) return [];
    return localExpenses;
  }, [isAuthenticated, cvExpenses, localExpenses]);

  const appraisals: Appraisal[] = useMemo(() => {
    if (isAuthenticated && cvAppraisals) return cvAppraisals.map(mapConvexAppraisalToLocal);
    if (isAuthenticated) return [];
    return localAppraisals;
  }, [isAuthenticated, cvAppraisals, localAppraisals]);

  const toastFn = useCallback((msg: string, type?: "success" | "error") => {
    if (type === "error") sonnerToast.error(msg);
    else sonnerToast.success(msg);
  }, []);

  const addVehicle = useCallback(
    (v: Omit<Vehicle, "id" | "created_at">) => {
      if (isAuthenticated) {
        createVehicleMut({
          year: v.year, make: v.make, model: v.model,
          trim: v.trim || undefined, vin: v.vin || undefined,
          miles: v.miles, purchasePrice: v.purchase_price,
          mechanicalCondition: v.mechanical_condition, appearance: v.appearance,
          exteriorColor: v.exterior_color || undefined, interiorColor: v.interior_color || undefined,
          status: v.status, stockNumber: v.stock_number || undefined,
          purchaseLocation: v.purchase_location || undefined,
          paymentMethod: v.payment_method || undefined,
          titleType: v.title_type || undefined,
          primaryDamage: v.primary_damage || undefined,
          secondaryDamage: v.secondary_damage || undefined,
          drivability: v.drivability || undefined,
          datePurchased: v.date_purchased || undefined,
          sellerName: v.seller_name || undefined, sellerPhone: v.seller_phone || undefined,
          sellerEmail: v.seller_email || undefined, sellerLocation: v.seller_location || undefined,
          sellerDescription: v.seller_description || undefined,
          buyerName: v.buyer_name || undefined, salePrice: v.sale_price || undefined,
          saleDate: v.sale_date || undefined, commission: v.commission || undefined,
          notes: v.notes || undefined,
        });
        return "pending";
      }
      const id = uid();
      setLocalVehicles((prev) => [
        { ...v, id, created_at: new Date().toISOString() } as Vehicle,
        ...prev,
      ]);
      return id;
    },
    [isAuthenticated, createVehicleMut],
  );

  const updateVehicle = useCallback(
    (id: string, data: Partial<Vehicle>) => {
      if (isAuthenticated) {
        const args: Record<string, unknown> = { id: id as any };
        if (data.year !== undefined) args.year = data.year;
        if (data.make !== undefined) args.make = data.make;
        if (data.model !== undefined) args.model = data.model;
        if (data.trim !== undefined) args.trim = data.trim;
        if (data.vin !== undefined) args.vin = data.vin;
        if (data.miles !== undefined) args.miles = data.miles;
        if (data.purchase_price !== undefined) args.purchasePrice = data.purchase_price;
        if (data.mechanical_condition !== undefined) args.mechanicalCondition = data.mechanical_condition;
        if (data.appearance !== undefined) args.appearance = data.appearance;
        if (data.exterior_color !== undefined) args.exteriorColor = data.exterior_color;
        if (data.interior_color !== undefined) args.interiorColor = data.interior_color;
        if (data.status !== undefined) args.status = data.status;
        if (data.stock_number !== undefined) args.stockNumber = data.stock_number;
        if (data.seller_name !== undefined) args.sellerName = data.seller_name;
        if (data.seller_phone !== undefined) args.sellerPhone = data.seller_phone;
        if (data.seller_email !== undefined) args.sellerEmail = data.seller_email;
        if (data.seller_location !== undefined) args.sellerLocation = data.seller_location;
        if (data.seller_description !== undefined) args.sellerDescription = data.seller_description;
        if (data.buyer_name !== undefined) args.buyerName = data.buyer_name;
        if (data.sale_price !== undefined) args.salePrice = data.sale_price;
        if (data.sale_date !== undefined) args.saleDate = data.sale_date;
        if (data.commission !== undefined) args.commission = data.commission;
        if (data.purchase_location !== undefined) args.purchaseLocation = data.purchase_location;
        if (data.payment_method !== undefined) args.paymentMethod = data.payment_method;
        if (data.title_type !== undefined) args.titleType = data.title_type;
        if (data.primary_damage !== undefined) args.primaryDamage = data.primary_damage;
        if (data.secondary_damage !== undefined) args.secondaryDamage = data.secondary_damage;
        if (data.drivability !== undefined) args.drivability = data.drivability;
        if (data.date_purchased !== undefined) args.datePurchased = data.date_purchased;
        if (data.notes !== undefined) args.notes = data.notes;
        updateVehicleMut(args as any);
        return;
      }
      setLocalVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...data } : v)),
      );
    },
    [isAuthenticated, updateVehicleMut],
  );

  const deleteVehicle = useCallback(
    (id: string) => {
      if (isAuthenticated) {
        deleteVehicleMut({ id: id as any });
        return;
      }
      setLocalVehicles((prev) => prev.filter((v) => v.id !== id));
      setLocalExpenses((prev) => prev.filter((e) => e.vehicle_id !== id));
      setLocalAppraisals((prev) => prev.filter((a) => a.vehicle_id !== id));
    },
    [isAuthenticated, deleteVehicleMut],
  );

  const addExpense = useCallback(
    (e: Omit<Expense, "id" | "created_at">) => {
      if (isAuthenticated) {
        createExpenseMut({
          vehicleId: e.vehicle_id as any, date: e.date,
          expenseType: e.type, description: e.description,
          amount: e.amount, isIncome: e.is_income,
        });
        return;
      }
      setLocalExpenses((prev) => [
        { ...e, id: uid(), created_at: new Date().toISOString() } as Expense,
        ...prev,
      ]);
    },
    [isAuthenticated, createExpenseMut],
  );

  const deleteExpense = useCallback(
    (id: string) => {
      if (isAuthenticated) {
        deleteExpenseMut({ id: id as any });
        return;
      }
      setLocalExpenses((prev) => prev.filter((e) => e.id !== id));
    },
    [isAuthenticated, deleteExpenseMut],
  );

  const addAppraisal = useCallback(
    (a: Omit<Appraisal, "id" | "created_at">) => {
      if (isAuthenticated) {
        createAppraisalMut({
          vehicleId: a.vehicle_id || undefined,
          year: a.year, make: a.make, model: a.model, trim: a.trim || undefined,
          miles: a.miles, mechanicalCondition: a.mechanical_condition,
          appearance: a.appearance, retail: a.retail, tradeIn: a.trade_in,
          privateParty: a.private_party, auction: a.auction, wholesale: a.wholesale,
        });
        return "pending";
      }
      const id = uid();
      setLocalAppraisals((prev) => [
        { ...a, id, created_at: new Date().toISOString() } as Appraisal,
        ...prev,
      ]);
      return id;
    },
    [isAuthenticated, createAppraisalMut],
  );

  const getLatestAppraisal = useCallback(
    (vehicleId: string) => {
      const va = appraisals
        .filter((a) => a.vehicle_id === vehicleId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return va[0] || null;
    },
    [appraisals],
  );

  const addMarketplaceListing = useCallback(
    (listing: Omit<MarketplaceListing, "id" | "postedAt">) => {
      setMarketplace((prev) => [
        { ...listing, id: uid(), postedAt: new Date().toISOString() },
        ...prev,
      ]);
    },
    [],
  );

  const addOffer = useCallback(
    (offer: Omit<MarketplaceOffer, "id" | "createdAt">) => {
      setOffers((prev) => [
        { ...offer, id: uid(), createdAt: new Date().toISOString() },
        ...prev,
      ]);
    },
    [],
  );

  const updateOfferStatus = useCallback(
    (id: string, status: MarketplaceOffer["status"]) => {
      setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    },
    [],
  );

  const addCategory = useCallback(
    (name: string) => {
      const colorIdx = categories.length % CATEGORY_COLORS.length;
      setCategories((prev) => [
        ...prev,
        { id: `cat-${uid().slice(0, 8)}`, name, color: CATEGORY_COLORS[colorIdx] },
      ]);
    },
    [categories.length],
  );

  const updateCategory = useCallback(
    (id: string, name: string) => {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    },
    [],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setLocalVehicles((prev) =>
        prev.map((v) => (v.categoryId === id ? { ...v, categoryId: undefined } : v)),
      );
    },
    [],
  );

  const value: StoreState = useMemo(
    () => ({
      vehicles, expenses, appraisals, marketplace, offers, categories,
      addVehicle, updateVehicle, deleteVehicle,
      addExpense, deleteExpense, addAppraisal,
      getLatestAppraisal, addMarketplaceListing,
      addOffer, updateOfferStatus,
      addCategory, updateCategory, deleteCategory,
      toast: toastFn, isCloudConnected: isAuthenticated,
    }),
    [
      vehicles, expenses, appraisals, marketplace, offers, categories,
      addVehicle, updateVehicle, deleteVehicle,
      addExpense, deleteExpense, addAppraisal,
      getLatestAppraisal, addMarketplaceListing,
      addOffer, updateOfferStatus,
      addCategory, updateCategory, deleteCategory,
      toastFn, isAuthenticated,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Local-only provider (used when no Convex URL is configured)       */
/* ------------------------------------------------------------------ */
function LocalStoreProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [appraisals, setAppraisals] = useState<Appraisal[]>(MOCK_APPRAISALS);
  const [marketplace, setMarketplace] = useState<MarketplaceListing[]>(MOCK_MARKETPLACE);
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>(DEFAULT_CATEGORIES);

  const toastFn = useCallback((msg: string, type?: "success" | "error") => {
    if (type === "error") sonnerToast.error(msg);
    else sonnerToast.success(msg);
  }, []);

  const addVehicle = useCallback(
    (v: Omit<Vehicle, "id" | "created_at">) => {
      const id = uid();
      setVehicles((prev) => [
        { ...v, id, created_at: new Date().toISOString() } as Vehicle,
        ...prev,
      ]);
      return id;
    },
    [],
  );

  const updateVehicle = useCallback(
    (id: string, data: Partial<Vehicle>) => {
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...data } : v)),
      );
    },
    [],
  );

  const deleteVehicle = useCallback(
    (id: string) => {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setExpenses((prev) => prev.filter((e) => e.vehicle_id !== id));
      setAppraisals((prev) => prev.filter((a) => a.vehicle_id !== id));
    },
    [],
  );

  const addExpense = useCallback(
    (e: Omit<Expense, "id" | "created_at">) => {
      setExpenses((prev) => [
        { ...e, id: uid(), created_at: new Date().toISOString() } as Expense,
        ...prev,
      ]);
    },
    [],
  );

  const deleteExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    },
    [],
  );

  const addAppraisal = useCallback(
    (a: Omit<Appraisal, "id" | "created_at">) => {
      const id = uid();
      setAppraisals((prev) => [
        { ...a, id, created_at: new Date().toISOString() } as Appraisal,
        ...prev,
      ]);
      return id;
    },
    [],
  );

  const getLatestAppraisal = useCallback(
    (vehicleId: string) => {
      const va = appraisals
        .filter((a) => a.vehicle_id === vehicleId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return va[0] || null;
    },
    [appraisals],
  );

  const addMarketplaceListing = useCallback(
    (listing: Omit<MarketplaceListing, "id" | "postedAt">) => {
      setMarketplace((prev) => [
        { ...listing, id: uid(), postedAt: new Date().toISOString() },
        ...prev,
      ]);
    },
    [],
  );

  const addOffer = useCallback(
    (offer: Omit<MarketplaceOffer, "id" | "createdAt">) => {
      setOffers((prev) => [
        { ...offer, id: uid(), createdAt: new Date().toISOString() },
        ...prev,
      ]);
    },
    [],
  );

  const updateOfferStatus = useCallback(
    (id: string, status: MarketplaceOffer["status"]) => {
      setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    },
    [],
  );

  const addCategory = useCallback(
    (name: string) => {
      const colorIdx = categories.length % CATEGORY_COLORS.length;
      setCategories((prev) => [
        ...prev,
        { id: `cat-${uid().slice(0, 8)}`, name, color: CATEGORY_COLORS[colorIdx] },
      ]);
    },
    [categories.length],
  );

  const updateCategory = useCallback(
    (id: string, name: string) => {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    },
    [],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setVehicles((prev) =>
        prev.map((v) => (v.categoryId === id ? { ...v, categoryId: undefined } : v)),
      );
    },
    [],
  );

  const value: StoreState = useMemo(
    () => ({
      vehicles, expenses, appraisals, marketplace, offers, categories,
      addVehicle, updateVehicle, deleteVehicle,
      addExpense, deleteExpense, addAppraisal,
      getLatestAppraisal, addMarketplaceListing,
      addOffer, updateOfferStatus,
      addCategory, updateCategory, deleteCategory,
      toast: toastFn, isCloudConnected: false,
    }),
    [
      vehicles, expenses, appraisals, marketplace, offers, categories,
      addVehicle, updateVehicle, deleteVehicle,
      addExpense, deleteExpense, addAppraisal,
      getLatestAppraisal, addMarketplaceListing,
      addOffer, updateOfferStatus,
      addCategory, updateCategory, deleteCategory,
      toastFn,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Public export                                                      */
/* ------------------------------------------------------------------ */
export function StoreProvider({ children }: { children: ReactNode }) {
  if (import.meta.env.VITE_CONVEX_URL) {
    return <CloudStoreProvider>{children}</CloudStoreProvider>;
  }
  return <LocalStoreProvider>{children}</LocalStoreProvider>;
}
