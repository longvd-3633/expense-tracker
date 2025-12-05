export interface User {
  id: string;                    // UUID from Supabase Auth
  email: string;                 // User email
  createdAt: Date;               // Account created timestamp
}

export interface UserSettings {
  userId: string;                // User ID
  currency: 'VND' | 'USD';       // Preferred currency
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD';
  numberFormat: '1.000.000' | '1,000,000';
  defaultView: 'dashboard' | 'transactions';
  theme: 'light' | 'dark' | 'system';
}
