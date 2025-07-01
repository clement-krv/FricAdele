import { useState, useEffect } from 'react';
import { statisticsAPI } from '../services/api';
import { formatCurrency, getCurrentMonth, getMonthName, generateColor } from '../utils/helpers';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Calendar, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

const Statistics = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentMonth = getCurrentMonth();

  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Fetch category distribution
      const startDate = getStartDate();
      const endDate = getEndDate();
      
      const categoryResponse = await statisticsAPI.getCategoryDistribution(startDate, endDate);
      setCategoryData(categoryResponse.data || []);

      // Fetch spending trends (last 12 months)
      const trendsResponse = await statisticsAPI.getSpendingTrends(12);
      setMonthlyTrends(trendsResponse.data || []);

    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error('Statistics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'current-month':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      case 'last-month':
        return new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      case 'current-year':
        return new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      case 'last-90-days':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }
  };

  const getEndDate = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'current-month':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      case 'last-month':
        return new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      case 'current-year':
        return new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      case 'last-90-days':
        return now.toISOString().split('T')[0];
      default:
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    }
  };

  const getPeriodTitle = () => {
    switch (selectedPeriod) {
      case 'current-month':
        return `${currentMonth.name} ${currentMonth.year}`;
      case 'last-month':
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return `${getMonthName(lastMonth.getMonth())} ${lastMonth.getFullYear()}`;
      case 'current-year':
        return `Année ${new Date().getFullYear()}`;
      case 'last-90-days':
        return '90 derniers jours';
      default:
        return '';
    }
  };

  // Prepare data for charts
  const pieChartData = categoryData.map((item, index) => ({
    name: item.category || 'Sans catégorie',
    value: item.total,
    color: generateColor(index),
  }));

  const barChartData = monthlyTrends.map(item => ({
    month: `${getMonthName(item.month - 1).substring(0, 3)} ${item.year}`,
    total: item.total,
  }));

  const totalAmount = categoryData.reduce((sum, item) => sum + item.total, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalAmount) * 100).toFixed(1);
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">
            {formatCurrency(data.value)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
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
            onClick={fetchStatistics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistiques</h1>
          <p className="text-gray-600">Analyse de vos dépenses et tendances</p>
        </div>

        {/* Period Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'current-month', label: 'Mois actuel' },
              { value: 'last-month', label: 'Mois dernier' },
              { value: 'last-90-days', label: '90 derniers jours' },
              { value: 'current-year', label: 'Année actuelle' },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total des dépenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
                </p>
                <p className="text-sm text-gray-500 mt-1">{getPeriodTitle()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nombre de catégories</p>
                <p className="text-2xl font-bold text-gray-900">{categoryData.length}</p>
                <p className="text-sm text-gray-500 mt-1">Avec des dépenses</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <PieChartIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Moyenne mensuelle</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monthlyTrends.length > 0 
                    ? formatCurrency(monthlyTrends.reduce((sum, item) => sum + item.total, 0) / monthlyTrends.length)
                    : formatCurrency(0)
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">12 derniers mois</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Distribution Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Répartition par catégorie - {getPeriodTitle()}
            </h2>
            
            {pieChartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PieChartIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Aucune donnée pour cette période</p>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Trends Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Évolution mensuelle (12 derniers mois)
            </h2>
            
            {barChartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Aucune donnée disponible</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Details Table */}
        {categoryData.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Détail par catégorie - {getPeriodTitle()}
              </h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-3 text-sm font-medium text-gray-600">Catégorie</th>
                      <th className="pb-3 text-sm font-medium text-gray-600">Montant</th>
                      <th className="pb-3 text-sm font-medium text-gray-600">Pourcentage</th>
                      <th className="pb-3 text-sm font-medium text-gray-600">Nombre de dépenses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData
                      .sort((a, b) => b.total - a.total)
                      .map((item, index) => {
                        const percentage = ((item.total / totalAmount) * 100).toFixed(1);
                        return (
                          <tr key={index} className="border-b border-gray-100 last:border-b-0">
                            <td className="py-3">
                              <div className="flex items-center space-x-3">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: generateColor(index) }}
                                ></div>
                                <span className="font-medium text-gray-900">
                                  {item.category || 'Sans catégorie'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 font-semibold text-gray-900">
                              {formatCurrency(item.total)}
                            </td>
                            <td className="py-3 text-gray-600">{percentage}%</td>
                            <td className="py-3 text-gray-600">{item.count}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
