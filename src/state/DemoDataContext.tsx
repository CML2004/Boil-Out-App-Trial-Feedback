import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { DEFAULT_TYPE_RULES } from "../domain/status";
import type { DemoStore, Fryer, HistoryEntry, StoreConfig } from "../domain/types";

const waitForDemoSave = () => new Promise((resolve) => window.setTimeout(resolve, 320));

function dateDaysAgo(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function timestampHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1_000).toISOString();
}

function baseConfig(overrides: Partial<StoreConfig> = {}): StoreConfig {
  return {
    usersForEmailAlerts: [
      { name: "Alex Morgan", email: "alex@example.com", alertsEnabled: true, assignmentAlerts: true, overdueAlerts: true },
      { name: "Jordan Lee", email: "jordan@example.com", alertsEnabled: true, assignmentAlerts: true, overdueAlerts: true }
    ],
    typeRules: structuredClone(DEFAULT_TYPE_RULES),
    alertSettings: { overdueReminderDays: 3 },
    storeStatus: { isLive: true },
    featureFlags: { emailAlertsLive: true, testingMode: false },
    ...overrides
  };
}

function createInitialStores(): DemoStore[] {
  const primaryFryers: Fryer[] = [
    {
      id: "1", name: "Pressure Fryer 1", type: "Pressure Fryer", lastBoilOut: dateDaysAgo(4),
      needsBoilOut: false, needsReason: "", needsNotes: "",
      history: [{ timestamp: timestampHoursAgo(96), action: "Boil-out logged", actionId: "demo-1", initials: "AM" }]
    },
    {
      id: "2", name: "Pressure Fryer 2", type: "Pressure Fryer", lastBoilOut: dateDaysAgo(23),
      needsBoilOut: false, needsReason: "", needsNotes: "",
      history: [{ timestamp: timestampHoursAgo(23 * 24), action: "Boil-out logged", actionId: "demo-2", initials: "JL" }]
    },
    {
      id: "3", name: "Pressure Fryer 3", type: "Pressure Fryer", lastBoilOut: dateDaysAgo(31),
      needsBoilOut: false, needsReason: "", needsNotes: "",
      history: [{ timestamp: timestampHoursAgo(31 * 24), action: "Boil-out logged", actionId: "demo-3", initials: "RK" }]
    },
    {
      id: "4", name: "Pressure Fryer 4", type: "Pressure Fryer", lastBoilOut: dateDaysAgo(12),
      needsBoilOut: true, needsReason: "oil-quality", needsNotes: "Oil is darkening sooner than expected.",
      history: [{ timestamp: timestampHoursAgo(2), action: "Boil-out needed flagged", actionId: "demo-4", initials: "TS", reason: "oil-quality", notes: "Oil is darkening sooner than expected." }]
    },
    {
      id: "5", name: "Open Single Fryer", type: "Open Single Fryer", lastBoilOut: dateDaysAgo(8),
      needsBoilOut: false, needsReason: "", needsNotes: "", history: []
    },
    {
      id: "6", name: "Open Double Fryer", type: "Open Double Fryer", lastBoilOut: dateDaysAgo(26),
      needsBoilOut: false, needsReason: "", needsNotes: "", history: []
    }
  ];

  return [
    {
      storeCode: "CFA02851",
      storeName: "Store 02851",
      config: baseConfig({ nickname: "Downtown Kitchen" }),
      fryers: primaryFryers,
      usage: { lastSeenAt: new Date().toISOString(), lastSeenPage: "store-dashboard", totalPageViews: 1248 },
      eventCount: 186
    },
    {
      storeCode: "CFA10432",
      storeName: "Store 10432",
      config: baseConfig({
        nickname: "Northside",
        storeStatus: { isLive: false },
        featureFlags: { emailAlertsLive: false, testingMode: true }
      }),
      fryers: structuredClone(primaryFryers.slice(0, 4)),
      usage: { lastSeenAt: timestampHoursAgo(5), lastSeenPage: "fryer-detail", totalPageViews: 318 },
      eventCount: 44
    },
    {
      storeCode: "CFA00777",
      storeName: "Store 00777",
      config: baseConfig({
        nickname: "Archived Pilot",
        storeStatus: { isLive: false },
        featureFlags: { emailAlertsLive: false, testingMode: false }
      }),
      fryers: structuredClone(primaryFryers.slice(0, 2)),
      usage: { lastSeenAt: timestampHoursAgo(96), lastSeenPage: "store-dashboard", totalPageViews: 67 },
      eventCount: 12
    }
  ];
}

interface DemoDataValue {
  stores: DemoStore[];
  getStore: (storeCode: string) => DemoStore | undefined;
  updateFryer: (storeCode: string, fryerId: string, fields: Partial<Omit<Fryer, "id" | "history">>, historyEntry?: HistoryEntry) => Promise<void>;
  addFryer: (storeCode: string, fryer: Fryer) => Promise<void>;
  deleteFryer: (storeCode: string, fryerId: string) => Promise<void>;
  saveConfig: (storeCode: string, config: StoreConfig) => Promise<void>;
  removeStore: (storeCode: string) => Promise<void>;
  resetDemo: () => void;
  snapshotDemo: () => DemoStore[];
  restoreDemo: (snapshot: DemoStore[]) => void;
}

const DemoDataContext = createContext<DemoDataValue | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState(createInitialStores);
  const storesRef = useRef(stores);

  const updateStores = useCallback((update: (current: DemoStore[]) => DemoStore[]) => {
    const next = update(storesRef.current);
    storesRef.current = next;
    setStores(next);
  }, []);

  const getStore = useCallback((storeCode: string) => stores.find((store) => store.storeCode === storeCode), [stores]);

  const updateFryer: DemoDataValue["updateFryer"] = useCallback(async (storeCode, fryerId, fields, historyEntry) => {
    await waitForDemoSave();
    updateStores((current) => current.map((store) => store.storeCode !== storeCode ? store : {
      ...store,
      eventCount: store.eventCount + 1,
      fryers: store.fryers.map((fryer) => fryer.id !== fryerId ? fryer : {
        ...fryer,
        ...fields,
        history: historyEntry ? [historyEntry, ...fryer.history] : fryer.history
      })
    }));
  }, [updateStores]);

  const addFryer: DemoDataValue["addFryer"] = useCallback(async (storeCode, fryer) => {
    await waitForDemoSave();
    updateStores((current) => current.map((store) => store.storeCode === storeCode
      ? { ...store, fryers: [...store.fryers, fryer], eventCount: store.eventCount + 1 }
      : store));
  }, [updateStores]);

  const deleteFryer: DemoDataValue["deleteFryer"] = useCallback(async (storeCode, fryerId) => {
    await waitForDemoSave();
    updateStores((current) => current.map((store) => store.storeCode === storeCode
      ? { ...store, fryers: store.fryers.filter((fryer) => fryer.id !== fryerId), eventCount: store.eventCount + 1 }
      : store));
  }, [updateStores]);

  const saveConfig: DemoDataValue["saveConfig"] = useCallback(async (storeCode, config) => {
    await waitForDemoSave();
    updateStores((current) => current.map((store) => store.storeCode === storeCode
      ? { ...store, config, eventCount: store.eventCount + 1 }
      : store));
  }, [updateStores]);

  const removeStore: DemoDataValue["removeStore"] = useCallback(async (storeCode) => {
    await waitForDemoSave();
    updateStores((current) => current.filter((store) => store.storeCode !== storeCode));
  }, [updateStores]);

  const resetDemo = useCallback(() => updateStores(() => createInitialStores()), [updateStores]);
  const snapshotDemo = useCallback(() => structuredClone(storesRef.current), []);
  const restoreDemo = useCallback((snapshot: DemoStore[]) => {
    const restored = structuredClone(snapshot);
    storesRef.current = restored;
    setStores(restored);
  }, []);

  const value = useMemo<DemoDataValue>(() => ({
    stores, getStore, updateFryer, addFryer, deleteFryer, saveConfig, removeStore, resetDemo, snapshotDemo, restoreDemo
  }), [addFryer, deleteFryer, getStore, removeStore, resetDemo, restoreDemo, saveConfig, snapshotDemo, stores, updateFryer]);

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData(): DemoDataValue {
  const value = useContext(DemoDataContext);
  if (!value) throw new Error("useDemoData must be used inside DemoDataProvider");
  return value;
}
