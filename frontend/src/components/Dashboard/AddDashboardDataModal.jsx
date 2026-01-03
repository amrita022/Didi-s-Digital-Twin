import React, { useState } from "react";
import { X, Wallet, Target, TrendingUp, TrendingDown, IndianRupee, DollarSign } from "lucide-react";

const AddDashboardDataModal = ({ onClose, onSave, existingData }) => {
  const [formData, setFormData] = useState({
    totalSavings: existingData?.totalSavings || "",
    goalTarget: existingData?.goalTarget || "",
    goalName: existingData?.goalName || "",
    todayIncome: existingData?.todayIncome || "",
    monthlyProfit: existingData?.monthlyProfit || "",
    monthlyExpenses: existingData?.monthlyExpenses || "",
    totalSales: existingData?.totalSales || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert to numbers before saving
    const dataToSave = {
      totalSavings: Number(formData.totalSavings) || 0,
      goalTarget: Number(formData.goalTarget) || 0,
      goalName: formData.goalName || "",
      todayIncome: Number(formData.todayIncome) || 0,
      monthlyProfit: Number(formData.monthlyProfit) || 0,
      monthlyExpenses: Number(formData.monthlyExpenses) || 0,
      totalSales: Number(formData.totalSales) || 0,
    };
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-700">
        {/* Header - Sticky */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Update Dashboard Data</h2>
              <p className="text-rose-100 text-sm mt-1">Enter your business metrics below</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-900">
          {/* Savings & Goals Section */}
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-5 border border-gray-700 hover:border-rose-500/50 transition-all duration-300">
            <h3 className="text-lg font-semibold text-rose-300 mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Savings & Goals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Total Savings (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="totalSavings"
                    value={formData.totalSavings}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-white transition-all"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Goal Target (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="goalTarget"
                    value={formData.goalTarget}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-white transition-all"
                    placeholder="25000"
                    min="0"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  name="goalName"
                  value={formData.goalName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-700 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-white transition-all"
                  placeholder="e.g., Buy Sewing Machine"
                />
              </div>
            </div>
          </div>

          {/* Income Section */}
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-5 border border-gray-700 hover:border-rose-500/50 transition-all duration-300">
            <h3 className="text-lg font-semibold text-rose-300 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Income & Sales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Today's Income (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="todayIncome"
                    value={formData.todayIncome}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-white transition-all"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Revenue earned today</p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Total Monthly Sales (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="totalSales"
                    value={formData.totalSales}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-white transition-all"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {typeof window !== 'undefined' && localStorage.getItem('language') === 'marathi' 
                    ? 'या महिन्यात एकूण विक्रय' 
                    : (typeof window !== 'undefined' && localStorage.getItem('language') === 'hindi'
                      ? 'इस महीने की कुल बिक्री'
                      : 'Total sales this month')}
                </p>
              </div>
            </div>
          </div>

          {/* Expenses & Profit Section */}
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-5 border border-gray-700 hover:border-rose-500/50 transition-all duration-300">
            <h3 className="text-lg font-semibold text-rose-300 mb-4 flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              {typeof window !== 'undefined' && localStorage.getItem('language') === 'marathi'
                ? 'खर्च आणि नफा'
                : (typeof window !== 'undefined' && localStorage.getItem('language') === 'hindi'
                  ? 'खर्च और लाभ'
                  : 'Expenses & Profit')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Monthly Expenses (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="monthlyExpenses"
                    value={formData.monthlyExpenses}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-white transition-all"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Total costs this month</p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Monthly Profit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="monthlyProfit"
                    value={formData.monthlyProfit}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-white transition-all"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Net profit this month</p>
              </div>
            </div>

            {/* Auto-calculated profit notice */}
            <div className="mt-4 p-3 bg-rose-950/30 rounded-lg border border-rose-500/30">
              <p className="text-sm text-rose-200">
                <strong>{typeof window !== 'undefined' && localStorage.getItem('language') === 'marathi' ? 'सूचना:' : (typeof window !== 'undefined' && localStorage.getItem('language') === 'hindi' ? 'सुझाव:' : 'Tip:')}</strong> 
                {typeof window !== 'undefined' && localStorage.getItem('language') === 'marathi'
                  ? ' नफा सामान्यतः विक्रय - खर्च म्हणून मोजला जातो. तुमची संख्या मिळते याची खात्री करा!'
                  : (typeof window !== 'undefined' && localStorage.getItem('language') === 'hindi'
                    ? ' लाभ आमतौर पर बिक्री - खर्च के रूप में गणना की जाती है। सुनिश्चित करें कि आपकी संख्या मेल खाती है!'
                    : ' Profit is usually calculated as Sales - Expenses. Make sure your numbers match!')}
              </p>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 rounded-xl p-5 border-2 border-gray-700">
            <h3 className="text-lg font-semibold text-rose-300 mb-3">
              {typeof window !== 'undefined' && localStorage.getItem('language') === 'marathi'
                ? 'द्रुत सारांश'
                : (typeof window !== 'undefined' && localStorage.getItem('language') === 'hindi'
                  ? 'त्वरित सारांश'
                  : 'Quick Summary')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-lg p-3 shadow-sm border border-gray-700 hover:border-rose-500/50 transition-all duration-300">
                <p className="text-xs text-gray-400 mb-1">
                  {typeof window !== 'undefined' && localStorage.getItem('language') === 'marathi'
                    ? 'बचत'
                    : (typeof window !== 'undefined' && localStorage.getItem('language') === 'hindi'
                      ? 'बचत'
                      : 'Savings')}
                </p>
                <p className="text-lg font-bold text-rose-400">₹{(Number(formData.totalSavings) || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-lg p-3 shadow-sm border border-gray-700 hover:border-rose-500/50 transition-all duration-300">
                <p className="text-xs text-gray-400 mb-1">Goal</p>
                <p className="text-lg font-bold text-rose-400">₹{(Number(formData.goalTarget) || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-lg p-3 shadow-sm border border-gray-700 hover:border-rose-500/50 transition-all duration-300">
                <p className="text-xs text-gray-400 mb-1">Sales</p>
                <p className="text-lg font-bold text-rose-400">₹{(Number(formData.totalSales) || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-lg p-3 shadow-sm border border-gray-700 hover:border-rose-500/50 transition-all duration-300">
                <p className="text-xs text-gray-400 mb-1">Profit</p>
                <p className="text-lg font-bold text-rose-400">₹{(Number(formData.monthlyProfit) || 0).toLocaleString()}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            {Number(formData.goalTarget) > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Goal Progress</span>
                  <span className="font-semibold text-rose-300">
                    {Math.round(((Number(formData.totalSavings) || 0) / (Number(formData.goalTarget) || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-rose-500 to-rose-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((Number(formData.totalSavings) || 0) / (Number(formData.goalTarget) || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-neutral-900 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Save Dashboard Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDashboardDataModal;