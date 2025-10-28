"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { IProperty } from "@/models";

interface CompareContextType {
  compareList: IProperty[];
  addToCompare: (property: IProperty) => void;
  removeFromCompare: (propertyId: string) => void;
  clearCompare: () => void;
  isInCompare: (propertyId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<IProperty[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("compareList");
    if (stored) {
      try {
        setCompareList(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse compare list from localStorage");
      }
    }
  }, []);

  // Save to localStorage whenever compareList changes
  useEffect(() => {
    localStorage.setItem("compareList", JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (property: IProperty) => {
    setCompareList((prev) => {
      // Limit to 4 properties for comparison
      if (prev.length >= 4) {
        alert("You can only compare up to 4 properties at a time");
        return prev;
      }
      // Check if already in list
      if (prev.some((p) => p._id === property._id)) {
        return prev;
      }
      return [...prev, property];
    });
  };

  const removeFromCompare = (propertyId: string) => {
    setCompareList((prev) => prev.filter((p) => p._id !== propertyId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (propertyId: string) => {
    return compareList.some((p) => p._id === propertyId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    // Safe fallback to avoid crashes when the provider hasn't mounted yet
    // (e.g., during streaming/hydration or in isolated client islands)
    return {
      compareList: [],
      addToCompare: () =>
        console.warn("CompareProvider not mounted; ignoring addToCompare"),
      removeFromCompare: () =>
        console.warn("CompareProvider not mounted; ignoring removeFromCompare"),
      clearCompare: () =>
        console.warn("CompareProvider not mounted; ignoring clearCompare"),
      isInCompare: () => false,
    };
  }
  return context;
}
