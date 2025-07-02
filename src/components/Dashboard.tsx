import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expenseAPI, statisticsAPI } from '../services/api';
import { formatCurrency, getCurrentMonth, getDateRange } from '../utils/helpers';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentMonth = getCurrentMonth();
  const dateRange = getDateRange('current-month');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Récupération des données du dashboard...');
      
      // Fetch recent expenses
      const expensesResponse = await expenseAPI.getExpenses({
        limit: 10,
        sort: '-date'
      });
      console.log('💰 Réponse dépenses:', expensesResponse);
      setExpenses(expensesResponse.expenses || []);

      // Fetch monthly statistics
      const statsResponse = await statisticsAPI.getMonthlyStats(
        currentMonth.year,
        currentMonth.month
      );
      console.log('� Réponse statistiques brute:', statsResponse);
      console.log('📊 Données statistiques:', statsResponse.data);
      
      const statsData = statsResponse.data || statsResponse;
      console.log('📊 Données statistiques traitées:', statsData);
      setMonthlyStats(statsData);

    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      return;
    }

    try {
      await expenseAPI.deleteExpense(expenseId);
      setExpenses(expenses.filter(expense => expense._id !== expenseId));
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Erreur lors de la suppression de la dépense');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const totalExpenses = monthlyStats?.totalAmount || 0;
  const expenseCount = monthlyStats?.totalCount || 0;
  const avgPerDay = monthlyStats?.averagePerDay || 0;
  const lastMonthComparison = monthlyStats?.comparisonWithLastMonth || 0;

  console.log('📈 Valeurs calculées pour affichage:', {
    totalExpenses,
    expenseCount,
    avgPerDay,
    lastMonthComparison,
    monthlyStats
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">
            Aperçu de vos dépenses pour {currentMonth.name} {currentMonth.year}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total des dépenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            {lastMonthComparison !== 0 && (
              <div className="flex items-center mt-2">
                {lastMonthComparison > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span className={`text-sm ${lastMonthComparison > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {Math.abs(lastMonthComparison).toFixed(1)}% vs mois dernier
                </span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nombre de dépenses</p>
                <p className="text-2xl font-bold text-gray-900">{expenseCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Moyenne par jour</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(avgPerDay)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actions rapides</p>
                <Link
                  to="/add-expense"
                  className="inline-flex items-center mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle dépense
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Dépenses récentes</h2>
              <Link
                to="/expenses"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                Voir tout
              </Link>
            </div>
          </div>

          <div className="p-6">
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Aucune dépense enregistrée</p>
                <Link
                  to="/add-expense"
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter votre première dépense
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: expense.category?.color || '#6B7280' }}
                        ></div>
                        <div>
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <p className="text-sm text-gray-500">
                            {expense.category?.name || 'Sans catégorie'} • {' '}
                            {new Date(expense.date).toLocaleDateString('fr-FR')}
                          </p>
                          {expense.tags && expense.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {expense.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/expenses/${expense._id}`}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/expenses/${expense._id}/edit`}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
