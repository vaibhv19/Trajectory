import { create } from 'zustand';
import React from 'react';

interface SidebarStore {
  content: React.ReactNode | null;
  setContent: (content: React.ReactNode | null) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  content: null,
  setContent: (content) => set({ content }),
  isOpen: localStorage.getItem('sidebarOpen') !== 'false',
  setIsOpen: (isOpen) => {
    localStorage.setItem('sidebarOpen', String(isOpen));
    set({ isOpen });
  }
}));
