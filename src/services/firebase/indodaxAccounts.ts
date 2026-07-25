// src/services/firebase/indodaxAccounts.ts
/**
==========================================================
AURA Trade OS
Indodax Account Management (Client SDK)
Version : 0.0.2 Alpha
==========================================================
*/
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { IndodaxAccount, NewIndodaxAccount } from "@/services/indodax/accountTypes";

function accountsRef(uid: string) {
  return collection(db, "users", uid, "indodaxAccounts");
}

export async function listIndodaxAccounts(uid: string): Promise<IndodaxAccount[]> {
  const q = query(accountsRef(uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<IndodaxAccount, "id">),
  }));
}

export async function addIndodaxAccount(uid: string, data: NewIndodaxAccount) {
  return addDoc(accountsRef(uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function toggleIndodaxAccountActive(uid: string, accountId: string, isActive: boolean) {
  return updateDoc(doc(db, "users", uid, "indodaxAccounts", accountId), { isActive });
}

export async function deleteIndodaxAccount(uid: string, accountId: string) {
  return deleteDoc(doc(db, "users", uid, "indodaxAccounts", accountId));
}
