import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Authentication state
  isLoggedIn: false,
  setIsLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),

  authView: 'login',
  setAuthView: (view) => set({ authView: view }), // ← FIXED HERE ✅

  // Language state
  language: 'english',
  setLanguage: (lang) => set({ language: lang }),

  // Global text-to-speech on hover
  ttsEnabled: false,
  setTtsEnabled: (enabled) => set({ ttsEnabled: enabled }),

  // User data
  userName: 'Rekha',
  setUserName: (name) => set({ userName: name }),
  // Firebase user id (for backend requests)
  userId: null,
  setUserId: (id) => set({ userId: id }),

  // Business data - provide defaults so UI components can render safely
  businessData: {
    savingsGoals: [],
    achievements: [],
    savings: 0,
    recentTransactions: [],
    totalRevenue: 0,
  },

  // Voice assistant state
  voiceState: {
    isListening: false,
    isProcessing: false,
    transcript: '',
    response: '',
    isSupported: 'speechRecognition' in window || 'webkitSpeechRecognition' in window,
  },

  // UI state
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Actions
  updateBusinessData: (data) => set((state) => ({
    businessData: { ...state.businessData, ...data },
  })),

  addTransaction: (transaction) => set((state) => ({
    businessData: {
      ...state.businessData,
      recentTransactions: [transaction, ...state.businessData.recentTransactions.slice(0, 9)],
    },
  })),

  updateVoiceState: (voiceData) => set((state) => ({
    voiceState: { ...state.voiceState, ...voiceData },
  })),

  // Demo mode
  demoMode: true,
  setDemoMode: (mode) => set({ demoMode: mode }),

  // Rekha's story progression
  storyProgress: {
    currentStep: 1,
    totalSteps: 6,
    completedSteps: [1],
  },
  updateStoryProgress: (step) => set((state) => ({
    storyProgress: {
      ...state.storyProgress,
      currentStep: step,
      completedSteps: [...state.storyProgress.completedSteps, step],
    },
  })),

  // Logout action - updated to clear real data too
  logout: () => {
    set({
      isLoggedIn: false,
      userName: 'Rekha',
    });
  },
}));

export default useStore;
