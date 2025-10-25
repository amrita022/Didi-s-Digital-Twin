// utils/aiinsights.js
const express = require("express");
const User = require("../models/User.js");
const AIInsight = require("../models/AIInsight");

const router = express.Router();

// 🔄 Sync Firebase user with MongoDB
router.post("/sync", async (req, res) => {
  const { userId, email } = req.body;

  if (!userId || !email)
    return res.status(400).json({ success: false, error: "Missing userId or email" });

  try {
    let user = await User.findOne({ userId });

    if (!user) {
      user = new User({ userId, email });
      await user.save();
      console.log(`🆕 New user created in MongoDB: ${email}`);
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

async function generateAIInsights(userId, transactions = []) {
  if (!transactions.length) return;

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = totalIncome - totalExpenses;
  const insights = [];

  if (profit < 0) {
    insights.push({
      type: "savings",
      title: "Your expenses exceed income this month",
      message: "Try reducing unnecessary costs or increasing revenue.",
      priority: "high"
    });
  } else if (profit > 0 && profit < totalIncome * 0.2) {
    insights.push({
      type: "savings",
      title: "Low profit margin detected",
      message: "You're earning but saving very little. Consider a goal-based saving plan.",
      priority: "medium"
    });
  } else {
    insights.push({
      type: "general",
      title: "Good financial health",
      message: "Your business is doing well this month. Keep it up!",
      priority: "low"
    });
  }

  for (const insight of insights) {
    await AIInsight.create({
      userId,
      ...insight,
      date: new Date()
    });
  }
}

module.exports = { router, generateAIInsights };