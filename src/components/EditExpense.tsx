import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { expenseAPI, categoryAPI, tagAPI } from '../services/api';
import { ArrowLeft, Save, X } from 'lucide-react';
import { validateSchema, validateField, expenseSchema } from '../utils/validation';
import toast from 'react-hot-toast';

const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    tags: [],
    date: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch expense, categories, and tags in parallel
      const [expenseResponse, categoriesResponse, tagsResponse] = await Promise.all([
        expenseAPI.getExpense(id),
        categoryAPI.getCategories(),
        tagAPI.getTags()
      ]);

      const expense = expenseResponse.expense;
      
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description,
        category: expense.category?._id || '',
        date: new Date(expense.date).toISOString().split('T')[0]
      });
      
      setCategories(categoriesResponse.categories || []);
      setTags(tagsResponse.tags || []);
      setSelectedTags(expense.tags?.map(tag => tag._id) || []);
      
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validation en temps réel
    const fieldError = validateField(expenseSchema, name, value, formData);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
    
    if (error) setError('');
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Préparer les données pour la validation
    const dataToValidate = {
      ...formData,
      tags: selectedTags.map(tagId => {
        const tag = tags.find(t => t._id === tagId);
        return tag ? { _id: tag._id, name: tag.name } : null;
      }).filter(Boolean)
    };

    // Validation avec Zod
    const validation = validateSchema(expenseSchema, dataToValidate);
    
    if (!validation.success) {
      setFieldErrors(validation.errors);
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setFieldErrors({});

      const expenseData = {
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category: formData.category || null,
        tags: selectedTags,
        date: formData.date
      };

      await expenseAPI.updateExpense(id, expenseData);
      
      toast.success('Dépense modifiée avec succès !');
      navigate(`/expenses/${id}`, { 
        replace: true,
        state: { message: 'Dépense modifiée avec succès' }
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la modification de la dépense';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error updating expense:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la dépense...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/expenses/${id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux détails
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Modifier la dépense</h1>
          <p className="text-gray-600 mt-2">
            Modifiez les informations de votre dépense
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Montant <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">€</span>
                </div>
              </div>
              {fieldErrors.amount && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.amount}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                required
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Décrivez votre dépense..."
              />
              {fieldErrors.description && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {fieldErrors.date && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.date}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => handleTagToggle(tag._id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag._id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              {tags.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">
                  Aucun tag disponible. Créez-en dans les paramètres.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                to={`/expenses/${id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Link>
              
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Modification...' : 'Modifier la dépense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditExpense;
