import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expenseAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  DollarSign,
  FileText,
} from 'lucide-react';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('-date');

  useEffect(() => {
    fetchExpenses();
  }, [sortBy]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseAPI.getExpenses({
        sort: sortBy,
        search: searchTerm
      });
      setExpenses(response.expenses || []);
    } catch (err) {
      setError('Erreur lors du chargement des dépenses');
      toast.error('Erreur lors du chargement des dépenses');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      return;
    }

    try {
      await expenseAPI.deleteExpense(expenseId);
      setExpenses(expenses.filter(expense => expense._id !== expenseId));
      toast.success('Dépense supprimée avec succès !');
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast.error('Erreur lors de la suppression de la dépense');
    }
  };

  const handleSearch = () => {
    fetchExpenses();
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des dépenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes dépenses</h1>
              <p className="text-gray-600 mt-2">
                Gérez toutes vos dépenses en un seul endroit
              </p>
            </div>
            <Link
              to="/add-expense"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle dépense
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher par description ou catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Trier par :</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="-date">Date (plus récent)</option>
                <option value="date">Date (plus ancien)</option>
                <option value="-amount">Montant (plus élevé)</option>
                <option value="amount">Montant (plus faible)</option>
                <option value="description">Description (A-Z)</option>
                <option value="-description">Description (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Aucun résultat trouvé' : 'Aucune dépense enregistrée'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Commencez par ajouter votre première dépense'
                }
              </p>
              {!searchTerm && (
                <Link
                  to="/add-expense"
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une dépense
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: expense.category?.color || '#6B7280' }}
                        ></div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {expense.description}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(expense.date).toLocaleDateString('fr-FR')}
                            </span>
                            {expense.category && (
                              <span>
                                {expense.category.name}
                              </span>
                            )}
                          </div>
                          {expense.tags && expense.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
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
                    
                    <div className="flex items-center space-x-4 ml-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/expenses/${expense._id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/expenses/${expense._id}/edit`}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredExpenses.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total des dépenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Nombre de dépenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredExpenses.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Dépense moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0) / 
                    filteredExpenses.length
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
