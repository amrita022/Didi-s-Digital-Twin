import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { getReminders, createReminder, dismissReminder, completeReminder } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import useStore from '../../store/useStore';

const Reminders = () => {
  const { uid } = useAuth();
  const { language } = useStore();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uid) {
      loadReminders();
    }
  }, [uid, language]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const response = await getReminders(uid, language);
      if (response.success) {
        setReminders(response.reminders || []);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleYes = async (reminder) => {
    try {
      // Create an active reminder when user clicks "yes"
      await createReminder({
        userId: uid,
        type: reminder.type,
        title: reminder.title,
        message: reminder.message,
        messageHindi: reminder.messageHindi,
        actionRequired: reminder.actionRequired || 'buy_materials',
        eventDate: reminder.eventDate,
        metadata: reminder.metadata
      });
      
      // Dismiss the original nudge
      if (reminder._id) {
        await dismissReminder(reminder._id, uid);
      }
      
      // Reload reminders
      await loadReminders();
    } catch (error) {
      console.error('Error setting reminder:', error);
    }
  };

  const handleDismiss = async (reminderId) => {
    try {
      await dismissReminder(reminderId, uid);
      await loadReminders();
    } catch (error) {
      console.error('Error dismissing reminder:', error);
    }
  };

  const handleComplete = async (reminderId) => {
    try {
      await completeReminder(reminderId, uid);
      await loadReminders();
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/50 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
      default:
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'seasonal_event':
        return <Sparkles size={20} className="text-yellow-400" />;
      case 'stock_analysis':
        return <AlertCircle size={20} className="text-blue-400" />;
      default:
        return <Bell size={20} className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-300">
          {language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}
        </p>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">
          {language === 'hindi' 
            ? 'कोई याददाश्त नहीं है' 
            : 'No reminders yet'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-rose-500/20 rounded-full text-sm font-medium text-rose-300">
          {reminders.length} {language === 'hindi' ? 'याददाश्त' : 'reminders'}
        </span>
      </div>

      <div className="space-y-3">
        {reminders.map((reminder) => (
          <div
            key={reminder._id}
            className={`p-4 rounded-lg border ${getPriorityColor(reminder.priority)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-1">
                  {getIcon(reminder.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1">{reminder.title}</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    {language === 'hindi' && reminder.messageHindi 
                      ? reminder.messageHindi 
                      : reminder.message}
                  </p>
                  
                  {/* Action buttons for seasonal events */}
                  {reminder.type === 'seasonal_event' && !reminder.actionRequired && (
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleYes(reminder)}
                        className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {language === 'hindi' ? 'हाँ, याद दिलाएं' : 'Yes, remind me'}
                      </button>
                      <button
                        onClick={() => handleDismiss(reminder._id)}
                        className="px-4 py-2 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-gray-700 hover:border-rose-500/50 text-white rounded-lg text-sm font-medium transition-all duration-300"
                      >
                        {language === 'hindi' ? 'नहीं' : 'No'}
                      </button>
                    </div>
                  )}
                  
                  {/* Action buttons for active reminders */}
                  {reminder.actionRequired && (
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleComplete(reminder._id)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        <Check size={16} />
                        <span>{language === 'hindi' ? 'पूर्ण' : 'Done'}</span>
                      </button>
                      <button
                        onClick={() => handleDismiss(reminder._id)}
                        className="px-4 py-2 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-gray-700 hover:border-rose-500/50 text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1"
                      >
                        <X size={16} />
                        <span>{language === 'hindi' ? 'खारिज' : 'Dismiss'}</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Dismiss button for info-only reminders */}
                  {!reminder.actionRequired && reminder.type !== 'seasonal_event' && (
                    <button
                      onClick={() => handleDismiss(reminder._id)}
                      className="mt-2 px-3 py-1 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-gray-700 hover:border-rose-500/50 text-white rounded text-sm transition-all duration-300"
                    >
                      {language === 'hindi' ? 'ठीक है' : 'Got it'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {reminder.metadata?.daysUntilEvent && (
              <div className="flex items-center space-x-1 text-xs text-gray-400 mt-2">
                <Clock size={12} />
                <span>
                  {language === 'hindi' 
                    ? `${reminder.metadata.daysUntilEvent} दिन बचे` 
                    : `${reminder.metadata.daysUntilEvent} days left`}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reminders;

