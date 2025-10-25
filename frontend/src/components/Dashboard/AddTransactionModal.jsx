import React, { useState } from "react";
import { X, ArrowUpRight, ArrowDownRight } from "lucide-react";

const AddTransactionModal = ({ onClose, onSave, language }) => {
  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    category: "",
    description: "",
    descriptionHindi: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.description) {
      alert("Please fill all required fields");
      return;
    }
    onSave({
      ...formData,
      amount: Number(formData.amount)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className={`p-6 rounded-t-2xl ${
          formData.type === 'income' 
            ? 'bg-gradient-to-r from-green-600 to-green-700' 
            : 'bg-gradient-to-r from-red-600 to-red-700'
        } text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'hindi' ? 'नया लेनदेन जोड़ें' : 'Add Transaction'}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {language === 'hindi' ? 'अपनी आय या व्यय दर्ज करें' : 'Record your income or expense'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              {language === 'hindi' ? 'प्रकार' : 'Type'} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  formData.type === 'income'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <ArrowUpRight size={20} />
                <span className="font-medium">
                  {language === 'hindi' ? 'आय' : 'Income'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  formData.type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <ArrowDownRight size={20} />
                <span className="font-medium">
                  {language === 'hindi' ? 'व्यय' : 'Expense'}
                </span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              {language === 'hindi' ? 'राशि (₹)' : 'Amount (₹)'} *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                required
                min="0"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              {language === 'hindi' ? 'श्रेणी' : 'Category'} *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">
                {language === 'hindi' ? 'श्रेणी चुनें' : 'Select Category'}
              </option>
              {formData.type === 'income' ? (
                <>
                  <option value="Sales">{language === 'hindi' ? 'बिक्री' : 'Sales'}</option>
                  <option value="Services">{language === 'hindi' ? 'सेवाएं' : 'Services'}</option>
                  <option value="Other Income">{language === 'hindi' ? 'अन्य आय' : 'Other Income'}</option>
                </>
              ) : (
                <>
                  <option value="Materials">{language === 'hindi' ? 'कच्चा माल' : 'Materials'}</option>
                  <option value="Packaging">{language === 'hindi' ? 'पैकेजिंग' : 'Packaging'}</option>
                  <option value="Transport">{language === 'hindi' ? 'परिवहन' : 'Transport'}</option>
                  <option value="Utilities">{language === 'hindi' ? 'उपयोगिताएं' : 'Utilities'}</option>
                  <option value="Other Expense">{language === 'hindi' ? 'अन्य खर्च' : 'Other Expense'}</option>
                </>
              )}
            </select>
          </div>

          {/* Description (English) */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Description (English) *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Pickle Sale - Mrs. Sharma"
              required
            />
          </div>

          {/* Description (Hindi) */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Description (Hindi)
            </label>
            <input
              type="text"
              name="descriptionHindi"
              value={formData.descriptionHindi}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="जैसे: अचार बिक्री - श्रीमती शर्मा"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              {language === 'hindi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className={`flex-1 px-6 py-3 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all ${
                formData.type === 'income'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
              }`}
            >
              {language === 'hindi' ? 'जोड़ें' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;