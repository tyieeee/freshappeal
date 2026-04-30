"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Address = {
  line1: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};

type ProfileState = {
  fullName: string;
  phone: string;
  address: Address | null;
  setProfile: (p: Partial<Pick<ProfileState, "fullName" | "phone">>) => void;
  setAddress: (a: Address | null) => void;
  clear: () => void;
};

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      fullName: "",
      phone: "",
      address: null,
      setProfile: (p) => set((s) => ({ ...s, ...p })),
      setAddress: (a) => set({ address: a }),
      clear: () => set({ fullName: "", phone: "", address: null }),
    }),
    { name: "fresh-profile" },
  ),
);
