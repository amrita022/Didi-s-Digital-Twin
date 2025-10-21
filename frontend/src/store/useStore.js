import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Language state
  language: 'english', // 'english' or 'hindi'
  setLanguage: (lang) => set({ language: lang }),

  // User data
  userName: 'Rekha',
  setUserName: (name) => set({ userName: name }),

  // Business data
  businessData: {
    totalSales: 2500,
    monthlyProfit: 800,
    expenses: 1700,
    savings: 5000,
    savingsGoal: 15000,
    healthScore: 75,
    recentTransactions: [
      { id: 1, type: 'sale', amount: 150, description: 'Pickle Sales', date: '2024-01-15' },
      { id: 2, type: 'expense', amount: 200, description: 'Spices', date: '2024-01-14' },
      { id: 3, type: 'sale', amount: 300, description: 'Pickle Sales', date: '2024-01-13' },
      { id: 4, type: 'expense', amount: 150, description: 'Jars', date: '2024-01-12' },
    ],
    products: [
      { id: 1, name: 'Mango Pickle', currentPrice: 80, suggestedPrice: 120, category: 'Pickles' },
      { id: 2, name: 'Lemon Pickle', currentPrice: 60, suggestedPrice: 90, category: 'Pickles' },
      { id: 3, name: 'Mixed Pickle', currentPrice: 100, suggestedPrice: 150, category: 'Pickles' },
    ],
    demandPredictions: [
      { month: 'Jan', demand: 'Low', reason: 'Winter season' },
      { month: 'Feb', demand: 'Medium', reason: 'Wedding season starts' },
      { month: 'Mar', demand: 'High', reason: 'Holi festival' },
      { month: 'Apr', demand: 'High', reason: 'Summer pickles popular' },
      { month: 'May', demand: 'Very High', reason: 'Peak summer season' },
      { month: 'Jun', demand: 'High', reason: 'Monsoon comfort food' },
    ],
    savingsGoals: [
      { id: 1, name: 'New Sewing Machine', target: 15000, current: 5000, deadline: '6 months' },
      { id: 2, name: 'Daughter College Fund', target: 50000, current: 20000, deadline: '2 years' },
      { id: 3, name: 'Shop Renovation', target: 25000, current: 8000, deadline: '1 year' },
    ],
    achievements: [
      { id: 1, name: 'First Sale', description: 'Made your first sale!', unlocked: true, date: '2024-01-01' },
      { id: 2, name: 'Pricing Pro', description: 'Learned optimal pricing', unlocked: true, date: '2024-01-10' },
      { id: 3, name: 'Savings Starter', description: 'Started saving regularly', unlocked: true, date: '2024-01-15' },
      { id: 4, name: 'Monthly Goal', description: 'Reached monthly target', unlocked: false, date: null },
    ],
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
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),

  // Actions
  updateBusinessData: (data) => set((state) => ({
    businessData: { ...state.businessData, ...data }
  })),

  addTransaction: (transaction) => set((state) => ({
    businessData: {
      ...state.businessData,
      recentTransactions: [transaction, ...state.businessData.recentTransactions.slice(0, 9)]
    }
  })),

  updateVoiceState: (voiceData) => set((state) => ({
    voiceState: { ...state.voiceState, ...voiceData }
  })),

  // Demo mode for Rekha's story
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
      completedSteps: [...state.storyProgress.completedSteps, step]
    }
  })),
}));

export default useStore;
