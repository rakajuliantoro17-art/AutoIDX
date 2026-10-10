// src/services/indodax/accountTypes.ts
export interface IndodaxAccount {
  id: string;
  label: string;
  apiKey: string;
  secretKey: string;
  isActive: boolean;
  createdAt: number;
}

export type NewIndodaxAccount = Omit<IndodaxAccount, "id" | "createdAt">;
