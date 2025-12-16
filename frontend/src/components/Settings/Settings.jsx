import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Bell, 
  Moon, 
  Sun,
  User,
  Shield,
  HelpCircle,
  LogOut,
  Save
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getTranslation } from '../../utils/translations';

const Settings = () => {
  const { 
    language, 
    setLanguage, 
    userName, 
    setUserName,
    demoMode,
    setDemoMode 
  } = useStore();

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    voiceEnabled: true,
    autoSync: true,
    fontSize: 'medium'
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const SettingItem = ({ icon: Icon, title, description, children, color = 'text-[#3A2B4D]' }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-lg bg-gray-100 ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-medium text-[#3A2B4D]">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="flex items-center">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-[#3B7A6D]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const Select = ({ value, onChange, options }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B7A6D] focus:border-transparent"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3A2B4D] to-[#3B7A6D] rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <SettingsIcon size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {getTranslation('settings', language)}
            </h1>
            <p className="text-white/90">
              {language === 'hindi' 
                ? 'अपनी सेटिंग्स को अनुकूलित करें' 
                : 'Customize your settings'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-[#3A2B4D] mb-4">
          {language === 'hindi' ? 'प्रोफ़ाइल सेटिंग्स' : 'Profile Settings'}
        </h2>
        <div className="space-y-4">
          <SettingItem
            icon={User}
            title={language === 'hindi' ? 'उपयोगकर्ता नाम' : 'User Name'}
            description={language === 'hindi' ? 'अपना नाम बदलें' : 'Change your name'}
          >
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B7A6D] focus:border-transparent"
            />
          </SettingItem>
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-[#3A2B4D] mb-4">
          {language === 'hindi' ? 'भाषा सेटिंग्स' : 'Language Settings'}
        </h2>
        <div className="space-y-4">
          <SettingItem
            icon={Globe}
            title={getTranslation('language', language)}
            description={language === 'hindi' ? 'अपनी पसंदीदा भाषा चुनें' : 'Choose your preferred language'}
          >
            <Select
              value={language}
              onChange={setLanguage}
              options={[
                { value: 'english', label: 'English' },
                { value: 'hindi', label: 'हिंदी' }
              ]}
            />
          </SettingItem>
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-[#3A2B4D] mb-4">
          {language === 'hindi' ? 'ऐप सेटिंग्स' : 'App Settings'}
        </h2>
        <div className="space-y-4">
          <SettingItem
            icon={Bell}
            title={getTranslation('notifications', language)}
            description={language === 'hindi' ? 'सूचनाएं चालू/बंद करें' : 'Turn notifications on/off'}
          >
            <Toggle
              enabled={settings.notifications}
              onChange={(value) => updateSetting('notifications', value)}
            />
          </SettingItem>

          <SettingItem
            icon={settings.darkMode ? Moon : Sun}
            title={getTranslation('darkMode', language)}
            description={language === 'hindi' ? 'डार्क मोड चालू/बंद करें' : 'Turn dark mode on/off'}
          >
            <Toggle
              enabled={settings.darkMode}
              onChange={(value) => updateSetting('darkMode', value)}
            />
          </SettingItem>

          <SettingItem
            icon={User}
            title={language === 'hindi' ? 'आवाज सहायक' : 'Voice Assistant'}
            description={language === 'hindi' ? 'आवाज सहायक चालू/बंद करें' : 'Turn voice assistant on/off'}
          >
            <Toggle
              enabled={settings.voiceEnabled}
              onChange={(value) => updateSetting('voiceEnabled', value)}
            />
          </SettingItem>

          <SettingItem
            icon={Shield}
            title={language === 'hindi' ? 'ऑटो सिंक' : 'Auto Sync'}
            description={language === 'hindi' ? 'डेटा स्वचालित रूप से सिंक करें' : 'Automatically sync data'}
          >
            <Toggle
              enabled={settings.autoSync}
              onChange={(value) => updateSetting('autoSync', value)}
            />
          </SettingItem>

          <SettingItem
            icon={User}
            title={language === 'hindi' ? 'फ़ॉन्ट आकार' : 'Font Size'}
            description={language === 'hindi' ? 'पाठ का आकार चुनें' : 'Choose text size'}
          >
            <Select
              value={settings.fontSize}
              onChange={(value) => updateSetting('fontSize', value)}
              options={[
                { value: 'small', label: language === 'hindi' ? 'छोटा' : 'Small' },
                { value: 'medium', label: language === 'hindi' ? 'मध्यम' : 'Medium' },
                { value: 'large', label: language === 'hindi' ? 'बड़ा' : 'Large' }
              ]}
            />
          </SettingItem>
        </div>
      </div>

      {/* Demo Mode */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-[#3A2B4D] mb-4">
          {language === 'hindi' ? 'डेमो मोड' : 'Demo Mode'}
        </h2>
        <div className="space-y-4">
          <SettingItem
            icon={User}
            title={language === 'hindi' ? 'हमें क्यों चुनें' : 'Why Choose Us'}
            description={language === 'hindi' ? 'हमारी सुविधाएं और सफलता की कहानियां देखें' : 'View our features and success stories'}
          >
            <Toggle
              enabled={demoMode}
              onChange={setDemoMode}
            />
          </SettingItem>
        </div>
        {demoMode && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {language === 'hindi' 
                ? 'हमारी सुविधाएं, लाभ और वास्तविक उपयोगकर्ताओं की सफलता की कहानियां देखें।' 
                : 'View our features, benefits, and success stories from real users.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Help & Support */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-[#3A2B4D] mb-4">
          {language === 'hindi' ? 'सहायता और समर्थन' : 'Help & Support'}
        </h2>
        <div className="space-y-4">
          <SettingItem
            icon={HelpCircle}
            title={language === 'hindi' ? 'सहायता' : 'Help'}
            description={language === 'hindi' ? 'सहायता और सुझाव प्राप्त करें' : 'Get help and tips'}
          >
            <button className="px-4 py-2 bg-[#3B7A6D] text-white rounded-lg hover:bg-[#2D5F52] transition-colors">
              {language === 'hindi' ? 'खोलें' : 'Open'}
            </button>
          </SettingItem>

          <SettingItem
            icon={User}
            title={language === 'hindi' ? 'संपर्क करें' : 'Contact Us'}
            description={language === 'hindi' ? 'हमसे संपर्क करें' : 'Get in touch with us'}
          >
            <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
              {language === 'hindi' ? 'संपर्क करें' : 'Contact'}
            </button>
          </SettingItem>
        </div>
      </div>

      {/* Save Settings */}
      <div className="flex justify-end">
        <button className="flex items-center space-x-2 px-6 py-3 bg-[#3B7A6D] text-white rounded-lg hover:bg-[#2D5F52] transition-colors">
          <Save size={16} />
          <span>{getTranslation('save', language)}</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
