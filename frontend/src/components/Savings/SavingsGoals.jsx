import React, { useState, useEffect } from 'react';
import { 
  PiggyBank, 
  Target, 
  Trophy, 
  Star,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  Gift,
  Sparkles,
  Loader2
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';
import {
  listSavingsGoals,
  createSavingsGoal,
  deleteSavingsGoal,
  incrementSavingsGoal,
  getDashboardData
} from '../../utils/api';
import { GlowingCard } from '../ui/glowing-card';

const SavingsGoals = () => {
  const { businessData, language, updateBusinessData, userId } = useStore();
  const { achievements = [], savings = 0 } = businessData || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goals, setGoals] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', deadline: '' });

  // Use demo userId when not logged in so the UI is still interactive during development
  const effectiveUserId = userId || 'DEMO_USER_ID';

  // Fetch goals on mount and when userId changes
  useEffect(() => {
    async function fetchGoals() {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedGoals = await listSavingsGoals(effectiveUserId);
        setGoals(fetchedGoals);

        // Fetch dashboard summary and sync businessData so totals update across the UI
        try {
          const dashboard = await getDashboardData(effectiveUserId);
          const totals = dashboard?.data || dashboard || {};
          updateBusinessData({
            savings: totals.totalSavings ?? totals.savings ?? 0,
            savingsGoals: fetchedGoals,
          });
        } catch (dashErr) {
          console.warn('Failed to fetch dashboard for totals:', dashErr);
        }
      } catch (err) {
        console.error('Failed to fetch goals:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    // Always attempt to fetch with a demo id if no authenticated user
    fetchGoals();
  }, [userId]);

  const addGoal = async () => {
    if (newGoal.name && newGoal.target && newGoal.deadline) {
      try {
        setError(null);
        const goal = await createSavingsGoal({
          title: newGoal.name,
          targetAmount: parseInt(newGoal.target),
          deadline: newGoal.deadline
          }, effectiveUserId);
        
        setGoals(prevGoals => [...prevGoals, goal]);
        setNewGoal({ name: '', target: '', deadline: '' });
        setShowAddGoal(false);
      } catch (err) {
        console.error('Failed to create goal:', err);
        setError('Failed to create goal: ' + err.message);
      }
    }
  };

  const updateGoalProgress = async (goalId, amount) => {
    try {
      setError(null);
  const updatedGoal = await incrementSavingsGoal(goalId, amount, effectiveUserId);
      setGoals(prevGoals => 
        prevGoals.map(goal => goal._id === goalId ? updatedGoal : goal)
      );
    } catch (err) {
      console.error('Failed to update goal:', err);
      setError('Failed to update goal: ' + err.message);
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      setError(null);
  await deleteSavingsGoal(goalId, effectiveUserId);
      setGoals(prevGoals => prevGoals.filter(goal => goal._id !== goalId));
    } catch (err) {
      console.error('Failed to delete goal:', err);
      setError('Failed to delete goal: ' + err.message);
    }
  };

  const getProgressPercentage = (current, target) => {
    // Guard against division by zero or missing target
    if (!target || target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const GoalCard = ({ goal }) => {
    const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
    const daysRemaining = getDaysRemaining(goal.deadline);
    const isCompleted = goal.isCompleted || progress === 100;
    const isOverdue = daysRemaining === 0 && !isCompleted;

    return (
      <GlowingCard className={`p-6 shadow-sm ${
        isCompleted ? 'ring-2 ring-rose-500' : ''
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">{(language === 'hindi' || language === 'marathi') ? goal.titleHindi || goal.title : goal.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>₹{(goal.currentAmount ?? 0).toLocaleString()} / ₹{(goal.targetAmount ?? 0).toLocaleString()}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isCompleted ? 'bg-rose-500/25 text-rose-300' :
                isOverdue ? 'bg-rose-500/25 text-rose-300' :
                'bg-rose-500/15 text-rose-300'
              }`}>
                {isCompleted 
                  ? (language === 'marathi' ? 'पूर्ण झाले' : (language === 'hindi' ? 'पूर्ण' : 'Completed'))
                  : isOverdue 
                  ? (language === 'marathi' ? 'मुदत संपली' : (language === 'hindi' ? 'समय सीमा खत्म' : 'Overdue'))
                  : (language === 'marathi' 
                    ? `${daysRemaining} दिवस बाकी` 
                    : (language === 'hindi' 
                      ? `${daysRemaining} दिन बचे` 
                      : `${daysRemaining} days left`))}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            {!isCompleted && (
              <button
                onClick={() => updateGoalProgress(goal._id, 100)}
                className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
              >
                <Plus size={16} />
              </button>
            )}
            <button
              onClick={() => deleteGoal(goal._id)}
              className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full h-3 border border-gray-700">
            <div 
              className="h-3 rounded-full transition-all duration-500 bg-rose-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>{progress}%</span>
            <span>
              ₹{Math.max((goal.targetAmount ?? 0) - (goal.currentAmount ?? 0), 0).toLocaleString()} {
                language === 'marathi' ? 'शिल्लक' : (language === 'hindi' ? 'शेष' : 'remaining')
              }
            </span>
          </div>
        </div>

        {/* Completion Celebration */}
        {isCompleted && (
          <div className="bg-rose-500/15 border border-rose-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle size={20} className="text-rose-400" />
              <span className="text-rose-300 font-medium">
                {language === 'marathi' 
                  ? getTranslation('goalAchieved', language)
                  : (language === 'hindi' 
                    ? 'लक्ष्य पूरा हो गया!'
                    : 'Goal Achieved!')}
              </span>
            </div>
          </div>
        )}

        {/* Quick Add Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => updateGoalProgress(goal._id, 50)}
            className="px-3 py-1 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-gray-700 text-gray-300 hover:border-rose-500/50 rounded text-sm transition-all duration-300"
          >
            +₹50
          </button>
          <button
            onClick={() => updateGoalProgress(goal._id, 100)}
            className="px-3 py-1 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-gray-700 text-gray-300 hover:border-rose-500/50 rounded text-sm transition-all duration-300"
          >
            +₹100
          </button>
          <button
            onClick={() => updateGoalProgress(goal._id, 500)}
            className="px-3 py-1 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-gray-700 text-gray-300 hover:border-rose-500/50 rounded text-sm transition-all duration-300"
          >
            +₹500
          </button>
        </div>
      </GlowingCard>
    );
  };

  const AchievementCard = ({ achievement }) => (
    <GlowingCard className={`p-4 shadow-sm ${
      achievement.unlocked 
        ? 'border-rose-500/30 bg-rose-500/10' 
        : ''
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          achievement.unlocked 
            ? 'bg-rose-500 text-white' 
            : 'bg-gradient-to-br from-neutral-800 to-neutral-900 text-gray-500 border border-gray-700'
        }`}>
          {achievement.unlocked ? <Trophy size={20} /> : <Clock size={20} />}
        </div>
        <div className="flex-1">
          <h3 className={`font-bold ${
            achievement.unlocked ? 'text-rose-300' : 'text-gray-400'
          }`}>
            {achievement.name}
          </h3>
          <p className={`text-sm ${
            achievement.unlocked ? 'text-rose-300/80' : 'text-gray-500'
          }`}>
            {achievement.description}
          </p>
          {achievement.unlocked && achievement.date && (
            <p className="text-xs text-rose-400/70 mt-1">
              Unlocked on {new Date(achievement.date).toLocaleDateString()}
            </p>
          )}
        </div>
        {achievement.unlocked && (
          <Sparkles size={20} className="text-rose-400" />
        )}
      </div>
    </GlowingCard>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlowingCard className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-rose-400/20 rounded-full flex items-center justify-center">
            <PiggyBank size={32} className="text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {getTranslation('savingsGoals', language)}
            </h1>
            <p className="text-gray-300">
              {language === 'marathi'
                ? 'आपली स्वप्ने पूर्ण करण्यासाठी बचत करा'
                : (language === 'hindi' 
                  ? 'अपने सपनों को पूरा करने के लिए बचत करें' 
                  : 'Save to achieve your dreams')}
            </p>
            </div>
          </div>
        </GlowingCard>

      {/* Total Savings Overview */}
      <GlowingCard className="p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {getTranslation('totalSavings', language)}
          </h2>
          <div className="text-right">
            <div className="text-3xl font-bold text-rose-400">₹{savings.toLocaleString()}</div>
            <div className="text-sm text-gray-400">
              {getTranslation('acrossAllGoals', language)}
            </div>
          </div>
        </div>
        <div className="w-full bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full h-3 border border-gray-700">
          <div 
            className="bg-rose-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((savings / 50000) * 100, 100)}%` }}
          ></div>
        </div>
      </GlowingCard>

      {/* Goals Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {getTranslation('myGoals', language)}
        </h2>
        <button
          onClick={() => setShowAddGoal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          <Plus size={16} />
          <span>{getTranslation('addGoal', language)}</span>
        </button>
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">
              {getTranslation('addNewGoal', language)}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {getTranslation('goalName', language)}
                </label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-700 bg-gradient-to-br from-neutral-800 to-neutral-900 text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder={getTranslation('exampleGoal', language)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {getTranslation('targetAmount', language)}
                </label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-700 bg-gradient-to-br from-neutral-800 to-neutral-900 text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="15000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {getTranslation('deadline', language)}
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-700 bg-gradient-to-br from-neutral-800 to-neutral-900 text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={addGoal}
                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                disabled={!newGoal.name || !newGoal.target || !newGoal.deadline}
              >
                {getTranslation('add', language)}
              </button>
              <button
                onClick={() => setShowAddGoal(false)}
                className="flex-1 px-4 py-2 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-gray-700 text-gray-300 rounded-lg hover:border-rose-500/50 transition-all duration-300"
              >
                {getTranslation('cancel', language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="col-span-2 bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-center">
            <div className="text-rose-400 mb-2">Error loading goals</div>
            <div className="text-rose-300 text-sm">{error}</div>
          </div>
        ) : goals.length === 0 ? (
          <GlowingCard className="col-span-2 p-6 text-center">
            <div className="text-gray-300 mb-2">No savings goals yet</div>
            <div className="text-gray-500 text-sm">Add your first goal to start tracking!</div>
          </GlowingCard>
        ) : goals.map((goal) => (
          <GoalCard key={goal._id} goal={goal} />
        ))}
      </div>

      {/* Achievements */}
      <GlowingCard className="p-6 shadow-sm">
        <h2 className="text-xl font-bold text-white mb-6">
          {language === 'marathi' ? 'उपलब्धी' : (language === 'hindi' ? 'उपलब्धियां' : 'Achievements')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements && achievements.length > 0 ? achievements.map((achievement) => (
            <AchievementCard key={achievement.id || achievement._id || Math.random()} achievement={achievement} />
          )) : (
            <p className="text-gray-400 text-sm col-span-2 text-center py-4">
              {getTranslation('nothingYet', language)}
            </p>
          )}
        </div>
      </GlowingCard>

      {/* Motivational Message */}
      <GlowingCard className="p-6 text-white text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Gift size={24} className="text-rose-400" />
          <h2 className="text-xl font-bold text-rose-300">
            {getTranslation('yourDreamCanComeTrue', language)}
          </h2>
        </div>
        <p className="text-gray-300">
          {language === 'marathi'
            ? 'दररोज ₹100 बचत केल्यास 6 महिन्यांत तुमच्याकडे ₹18,000 होतील. हे तुमच्या नवीन सिलाई मशीनसाठी पुरेसे आहे!'
            : (language === 'hindi' 
              ? 'प्रतिदिन ₹100 बचाने से 6 महीने में आप ₹18,000 बचा सकते हैं। यह आपके नए सिलाई मशीन के लिए पर्याप्त है!' 
              : 'Saving ₹100 daily for 6 months will give you ₹18,000. That\'s enough for your new sewing machine!')}
        </p>
      </GlowingCard>
    </div>
  );
};

export default SavingsGoals;
