import ExpenseModel from '../models/expenseModal.js';
import mongoose from 'mongoose';

const addExpense = async (req, res) => {
  try {
    const { expenseName, amount, category, date, description } = req.body;
    const userId = req.userId; 

    const newExpense = new ExpenseModel({
      expenseName,
      amount,
      category,
      date,
      description,
      user: userId, 
    });

    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).send('Error adding expense');
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { expenseName, amount, category, date, description } = req.body;

    const updatedExpense = await ExpenseModel.findOneAndUpdate(
      { _id: id, user: req.userId },
      { expenseName, amount, category, date, description },
      { new: true }
    );

    if (!updatedExpense) {
      res.status(404).send('Expense not found');
      return
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).send('Error updating expense');
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedExpense = await ExpenseModel.findOneAndDelete({ _id: id, user: req.userId });

    if (!deletedExpense) {
      res.status(404).send('Expense not found');
      return
    }

    res.status(200).send('Expense deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting expense');
  }
};

const getExpenses = async (req, res) => {
  try {
    const userId = req.userId; 
    let filter = { user: userId };

    const expenses = await ExpenseModel.find(filter).sort({ date: -1 });

    const totalExpenses = await ExpenseModel.countDocuments(filter);

    res.status(200).json({ expenses, totalExpenses });
  } catch (error) {
    res.status(500).send('Error fetching expenses');
  }
};

const getSpendingInsights = async (req, res) => {
  console.log('Received request for spending insights');
  try {
    console.log("inside getSpendingInsights");
    
    const userId = req.userId;

    if (!userId) {
      console.log("User ID is missing in the request.");
      res.status(400).send("User ID not found in request");
      return 
    }

    const insights = await ExpenseModel.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$category', totalSpent: { $sum: '$amount' } } },
      { $sort: { totalSpent: -1 } },
    ]);

    console.log(insights);
  
    const totalSpent = insights.reduce((sum, item) => sum + item.totalSpent, 0);

    const categoryPercentages = insights.map((item) => ({
      category: item._id,
      totalSpent: item.totalSpent,
      percentage: (item.totalSpent / totalSpent) * 100,
    }));

    console.log(categoryPercentages);
    

    res.status(200).json({ categoryPercentages, totalSpent });
  } catch (error) {
    res.status(500).send('Error calculating spending insights');
  }
};

export { addExpense, updateExpense, deleteExpense, getExpenses, getSpendingInsights };
