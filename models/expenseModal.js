import mongoose, { Schema } from 'mongoose';


const expenseSchema = new Schema({
    expenseName: { type: String },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const ExpenseModel = mongoose.model('Expense', expenseSchema);

export default ExpenseModel;
