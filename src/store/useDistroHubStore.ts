"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Pack, PresetResponse, QuizAnswers } from "@/types/distrohub";

export interface SavedPresetItem extends PresetResponse {
  distroSlug: string;
  packageCount: number;
  createdAt: string;
}

interface DistroHubLocalState {
  // Rascunho do configurador
  distroSlug: string;
  activePack: Pack;
  selectedPackages: string[];

  // Último resultado do quiz
  lastQuizAnswers: QuizAnswers | null;
  recommendedDistroSlug: string | null;

  // Favoritos locais e histórico dos links curl | bash
  favoriteDistros: string[];
  recentPresets: SavedPresetItem[];

  // Ações
  setConfiguratorDraft: (draft: {
    distroSlug?: string;
    activePack?: Pack;
    selectedPackages?: string[];
  }) => void;
  setQuizResult: (answers: QuizAnswers, winnerSlug: string) => void;
  toggleFavoriteDistro: (slug: string) => void;
  addRecentPreset: (preset: SavedPresetItem) => void;
  clearHistory: () => void;
}

const MAX_RECENT_PRESETS = 10;

export const useDistroHubStore = create<DistroHubLocalState>()(
  persist(
    (set) => ({
      distroSlug: "",
      activePack: "dev",
      selectedPackages: [],
      lastQuizAnswers: null,
      recommendedDistroSlug: null,
      favoriteDistros: [],
      recentPresets: [],

      setConfiguratorDraft: (draft) =>
        set((state) => ({
          distroSlug: draft.distroSlug ?? state.distroSlug,
          activePack: draft.activePack ?? state.activePack,
          selectedPackages: draft.selectedPackages ?? state.selectedPackages,
        })),

      setQuizResult: (answers, winnerSlug) =>
        set(() => ({
          lastQuizAnswers: answers,
          recommendedDistroSlug: winnerSlug,
        })),

      toggleFavoriteDistro: (slug) =>
        set((state) => ({
          favoriteDistros: state.favoriteDistros.includes(slug)
            ? state.favoriteDistros.filter((item) => item !== slug)
            : [...state.favoriteDistros, slug],
        })),

      addRecentPreset: (preset) =>
        set((state) => ({
          recentPresets: [
            preset,
            ...state.recentPresets.filter(
              (item) => item.shortId !== preset.shortId
            ),
          ].slice(0, MAX_RECENT_PRESETS),
        })),

      clearHistory: () =>
        set(() => ({
          recentPresets: [],
          lastQuizAnswers: null,
          recommendedDistroSlug: null,
        })),
    }),
    {
      name: "distrohub-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
