import React, { useState } from 'react';
import { neo4jAPI } from '../services/api.ts';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Download,
  Euro,
  Calendar
} from 'lucide-react';

const Neo4jRecurring = () => {
  const { user } = useAuth();
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [analysisMonths, setAnalysisMonths] = useState(2);
  const [showResults, setShowResults] = useState(false);

  const importUserData = async () => {
    try {
      setImportLoading(true);
      const response = await neo4jAPI.importUserExpenses();
      toast.success(response.message);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'import';
      toast.error(errorMessage);
    } finally {
      setImportLoading(false);
    }
  };

  const analyzeRecurring = async () => {
    try {
      setLoading(true);
      setShowResults(false);
      
      const recurringResponse = await neo4jAPI.getRecurringExpenses(analysisMonths);
      
      setRecurringExpenses(recurringResponse.data.recurringExpenses || []);
      setShowResults(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'analyse';
      toast.error(errorMessage);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analyse Neo4j - Dépenses Récurrentes
          </h1>
          <p className="text-gray-600">
            Importez vos dépenses MongoDB et analysez les récurrences
          </p>
        </div>

        {/* Section Import */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Import des données MongoDB → Neo4j
          </h3>
          
          <p className="text-gray-600 mb-4">
            Importez vos dépenses MongoDB vers Neo4j pour l'analyse des récurrences.
            {user && <span className="block text-sm mt-1 text-blue-600">Utilisateur: {user.name || user.email}</span>}
          </p>
          
          <button
            onClick={importUserData}
            disabled={importLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {importLoading ? 'Import en cours...' : 'Importer mes dépenses'}
          </button>
        </div>

        {/* Section Analyse */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Analyse des récurrences
          </h3>
          
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-gray-700">
              Période d'analyse:
            </label>
            <select
              value={analysisMonths}
              onChange={(e) => setAnalysisMonths(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value={1}>1 mois</option>
              <option value={2}>2 mois</option>
              <option value={3}>3 mois</option>
              <option value={6}>6 mois</option>
              <option value={12}>12 mois</option>
            </select>
            
            <button
              onClick={analyzeRecurring}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              {loading ? 'Analyse en cours...' : 'Analyser les récurrences'}
            </button>
          </div>
          
          {/* Affichage des résultats directement sous le bouton */}
          {showResults && !loading && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              {recurringExpenses.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    {recurringExpenses.length} dépense{recurringExpenses.length > 1 ? 's' : ''} récurrente{recurringExpenses.length > 1 ? 's' : ''} détectée{recurringExpenses.length > 1 ? 's' : ''} sur {analysisMonths} mois
                  </div>
                  
                  <div className="grid gap-3">
                    {recurringExpenses.map((expense, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{expense.description}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Euro className="w-4 h-4" />
                                {formatCurrency(expense.amount)} par occurrence
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {expense.occurrences} fois
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-700">
                              {formatCurrency(expense.amount * expense.occurrences)}
                            </div>
                            <div className="text-sm text-gray-500">Total</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Intervalles (jours):</span>
                            <div className="text-gray-600">{expense.intervals?.join(', ') || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Dernières dates:</span>
                            <div className="text-gray-600">
                              {expense.dates?.slice(-3).map(date => formatDate(date)).join(', ')}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Fréquence:</span>
                            <div className="text-gray-600">~Mensuelle</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">Aucune dépense récurrente détectée</p>
                  <p className="text-sm">Essayez d'augmenter la période d'analyse ou vérifiez que vos données sont importées.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Neo4jRecurring;
