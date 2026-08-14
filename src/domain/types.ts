export type FryerStatus = "ok" | "needed" | "overdue";

export interface FryerTypeRule {
  neededDays: number;
  overdueDays: number;
}

export type FryerTypeRules = Record<string, FryerTypeRule>;

export interface EmailRecipient {
  name: string;
  email: string;
  alertsEnabled: boolean;
  assignmentAlerts: boolean;
  overdueAlerts: boolean;
}

export interface StoreConfig {
  nickname?: string;
  usersForEmailAlerts: EmailRecipient[];
  typeRules: FryerTypeRules;
  alertSettings: { overdueReminderDays: number };
  storeStatus: { isLive: boolean };
  featureFlags: { emailAlertsLive: boolean; testingMode: boolean };
}

export interface HistoryEntry {
  timestamp: string;
  action: string;
  actionId?: string;
  initials?: string;
  reason?: string;
  notes?: string;
  dateValue?: string;
}

export interface Fryer {
  id: string;
  name: string;
  type: string;
  lastBoilOut: string;
  needsBoilOut: boolean;
  needsReason: string;
  needsNotes: string;
  history: HistoryEntry[];
}

export interface DemoStore {
  storeCode: string;
  storeName: string;
  config: StoreConfig;
  fryers: Fryer[];
  usage: {
    lastSeenAt: string;
    lastSeenPage: string;
    totalPageViews: number;
  };
  eventCount: number;
}
