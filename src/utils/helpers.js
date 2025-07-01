export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date, format = 'short') => {
  const options = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
    monthYear: { month: 'long', year: 'numeric' },
  };

  return new Intl.DateTimeFormat('fr-FR', options[format]).format(new Date(date));
};

export const formatDateForInput = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

export const getMonthName = (monthIndex) => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[monthIndex];
};

export const getCurrentMonth = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    name: getMonthName(now.getMonth())
  };
};

export const getDateRange = (type = 'current-month') => {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();

  switch (type) {
    case 'current-month':
      startDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + 1, 0);
      break;
    case 'last-month':
      startDate.setMonth(startDate.getMonth() - 1, 1);
      endDate.setDate(0);
      break;
    case 'current-year':
      startDate.setMonth(0, 1);
      endDate.setMonth(11, 31);
      break;
    case 'last-30-days':
      startDate.setDate(now.getDate() - 30);
      break;
    case 'last-90-days':
      startDate.setDate(now.getDate() - 90);
      break;
    default:
      break;
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

export const calculateTotal = (expenses) => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const groupExpensesByCategory = (expenses) => {
  return expenses.reduce((groups, expense) => {
    const category = expense.category?.name || 'Sans catégorie';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(expense);
    return groups;
  }, {});
};

export const groupExpensesByMonth = (expenses) => {
  return expenses.reduce((groups, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(expense);
    return groups;
  }, {});
};

export const calculateCategoryTotals = (expenses) => {
  const grouped = groupExpensesByCategory(expenses);
  return Object.entries(grouped).map(([category, categoryExpenses]) => ({
    category,
    total: calculateTotal(categoryExpenses),
    count: categoryExpenses.length,
  }));
};

export const calculateMonthlyTotals = (expenses) => {
  const grouped = groupExpensesByMonth(expenses);
  return Object.entries(grouped).map(([monthKey, monthExpenses]) => {
    const [year, month] = monthKey.split('-');
    return {
      month: parseInt(month),
      year: parseInt(year),
      total: calculateTotal(monthExpenses),
      count: monthExpenses.length,
      monthName: getMonthName(parseInt(month) - 1),
    };
  }).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const generateColor = (index) => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#F43F5E', '#8B5A2B', '#6B7280', '#059669'
  ];
  return colors[index % colors.length];
};
