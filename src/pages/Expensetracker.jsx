import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseTracker = () => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [budget, setBudget] = useState(() => {
    const savedBudget = localStorage.getItem('budget');
    return savedBudget ? JSON.parse(savedBudget) : '';
  });
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });
  const [editingId, setEditingId] = useState(null);
  const [filterAmount, setFilterAmount] = useState('');

  const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (editingId) {
      const updatedExpenses = expenses.map((expense) =>
        expense.id === editingId
          ? { ...expense, name, amount: parseFloat(amount), category, notes }
          : expense
      );
      setExpenses(updatedExpenses);
      setEditingId(null);
    } else {
      const newExpense = {
        id: Date.now(),
        name,
        amount: parseFloat(amount),
        category,
        notes,
      };
      setExpenses([...expenses, newExpense]);
    }
    setName('');
    setAmount('');
    setNotes('');
    setCategory('');
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const handleEditExpense = (expense) => {
    setName(expense.name);
    setAmount(expense.amount);
    setCategory(expense.category);
    setNotes(expense.notes);
    setEditingId(expense.id);
  };

  const generateCategoryData = () => {
    const categoryTotals = {};
    expenses.forEach((expense) => {
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] += expense.amount;
      } else {
        categoryTotals[expense.category] = expense.amount;
      }
    });
    return {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          data: Object.values(categoryTotals),
          backgroundColor: [
            '#3B82F6',
            '#F59E0B',
            '#10B981',
            '#EF4444',
            '#8B5CF6',
            '#F97316',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const handleResetTracker = () => {
    if (confirm('Are you sure you want to reset everything?')) {
      setExpenses([]);
      setBudget('');
      setFilterAmount('');
      setFilterCategory('');
      setName('');
      setAmount('');
      setCategory('');
      setEditingId(null);
      localStorage.clear();
    }
  };

  const handleDownloadCSV = () => {
    const csvRows = [
      ['Name', 'Amount', 'Category'],
      ...expenses.map((expense) => [
        expense.name,
        expense.amount,
        expense.category,
      ]),
    ];
    const csvContent = csvRows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'expenses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('budget', JSON.stringify(budget));
  }, [budget]);

  return (
    <div className="container">
      <h1 className="heading">Smart Expense Tracker</h1>

      <div className="dashboard-grid">
        {/* Left: Form */}
        <div>
          <form onSubmit={handleAddExpense}>
            <div className="total-spent">
              Total Spent: <span>${total.toFixed(2)}</span>
            </div>
            <input
              type="text"
              placeholder="Expense Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Rent">Rent</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="number"
              placeholder="Set Budget Limit (Optional)"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <button type="submit" className="button-primary">
              {editingId ? 'Update' : 'Add'}
            </button>
          </form>
        </div>

        {/* Middle: Filters and Expenses List */}
        <div>
          <div className="filters-card">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Filter by Category</option>
              <option value="Food">Food</option>
              <option value="Rent">Rent</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="number"
              placeholder="Filter expenses above..."
              value={filterAmount}
              onChange={(e) => setFilterAmount(e.target.value)}
            />
            <div className="actions-row">
              <button onClick={handleResetTracker} className="button-danger">
                Reset Tracker
              </button>
              <button onClick={handleDownloadCSV} className="button-primary">
                Download CSV
              </button>
            </div>
          </div>
          <div className="expense-scroll-box">
            {expenses.length === 0 ? (
              <p className="text-gray-500">No expenses added yet.</p>
            ) : (
              expenses
                .filter((expense) =>
                  filterAmount
                    ? expense.amount >= parseFloat(filterAmount)
                    : true
                )
                .filter((expense) =>
                  filterCategory ? expense.category === filterCategory : true
                )
                .map((expense) => (
                  <div key={expense.id} className="expense-card">
                    <div className="expense-info">
                      <p className="font-medium">
                        {expense.name}{' '}
                        {expense.category && (
                          <span className="text-xs text-gray-500">
                            ({expense.category})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${expense.amount.toFixed(2)}
                      </p>
                      {expense.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          Notes: {expense.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="button-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="button-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Right: Pie Chart */}
        <div>
          <div className="chart-container">
            <h2 className="subheading">Spending Breakdown</h2>
            <Pie data={generateCategoryData()} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
