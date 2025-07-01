import { useState, useEffect } from 'react';
import { categoryAPI, tagAPI } from '../services/api';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

const Settings = () => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3B82F6' });
  const [newTag, setNewTag] = useState({ name: '' });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);

  const defaultColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, tagsResponse] = await Promise.all([
        categoryAPI.getCategories(),
        tagAPI.getTags()
      ]);
      
      setCategories(categoriesResponse.categories || []);
      setTags(tagsResponse.tags || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Category Management
  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return;

    try {
      const response = await categoryAPI.createCategory(newCategory);
      setCategories([...categories, response.category]);
      setNewCategory({ name: '', color: '#3B82F6' });
      setShowAddCategory(false);
    } catch (err) {
      console.error('Error creating category:', err);
      alert('Erreur lors de la création de la catégorie');
    }
  };

  const handleUpdateCategory = async (id, updatedData) => {
    try {
      const response = await categoryAPI.updateCategory(id, updatedData);
      setCategories(categories.map(cat => 
        cat._id === id ? response.category : cat
      ));
      setEditingCategory(null);
    } catch (err) {
      console.error('Error updating category:', err);
      alert('Erreur lors de la mise à jour de la catégorie');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.')) {
      return;
    }

    try {
      await categoryAPI.deleteCategory(id);
      setCategories(categories.filter(cat => cat._id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Erreur lors de la suppression de la catégorie');
    }
  };

  // Tag Management
  const handleCreateTag = async () => {
    if (!newTag.name.trim()) return;

    try {
      const response = await tagAPI.createTag(newTag);
      setTags([...tags, response.tag]);
      setNewTag({ name: '' });
      setShowAddTag(false);
    } catch (err) {
      console.error('Error creating tag:', err);
      alert('Erreur lors de la création du tag');
    }
  };

  const handleUpdateTag = async (id, updatedData) => {
    try {
      const response = await tagAPI.updateTag(id, updatedData);
      setTags(tags.map(tag => 
        tag._id === id ? response.tag : tag
      ));
      setEditingTag(null);
    } catch (err) {
      console.error('Error updating tag:', err);
      alert('Erreur lors de la mise à jour du tag');
    }
  };

  const handleDeleteTag = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce tag ?')) {
      return;
    }

    try {
      await tagAPI.deleteTag(id);
      setTags(tags.filter(tag => tag._id !== id));
    } catch (err) {
      console.error('Error deleting tag:', err);
      alert('Erreur lors de la suppression du tag');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-2">Gérez vos catégories et tags personnalisés</p>
        </div>

        <div className="space-y-8">
          {/* Categories Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Catégories</h2>
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une catégorie</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Add Category Form */}
              {showAddCategory && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Nouvelle catégorie</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la catégorie
                      </label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Alimentation, Transport..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur
                      </label>
                      <div className="flex space-x-2">
                        {defaultColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewCategory({ ...newCategory, color })}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              newCategory.color === color 
                                ? 'border-gray-800 scale-110' 
                                : 'border-gray-300 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={handleCreateCategory}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Enregistrer</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCategory(false);
                        setNewCategory({ name: '', color: '#3B82F6' });
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Categories List */}
              <div className="space-y-3">
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune catégorie créée</p>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {editingCategory === category._id ? (
                        <CategoryEditForm
                          category={category}
                          onSave={(updatedData) => handleUpdateCategory(category._id, updatedData)}
                          onCancel={() => setEditingCategory(null)}
                          defaultColors={defaultColors}
                        />
                      ) : (
                        <>
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium text-gray-900">{category.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEditingCategory(category._id)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Tags</h2>
                <button
                  onClick={() => setShowAddTag(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un tag</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Add Tag Form */}
              {showAddTag && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Nouveau tag</h3>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newTag.name}
                      onChange={(e) => setNewTag({ name: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom du tag"
                    />
                    <button
                      onClick={handleCreateTag}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Enregistrer</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddTag(false);
                        setNewTag({ name: '' });
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Tags List */}
              <div className="flex flex-wrap gap-3">
                {tags.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 w-full">Aucun tag créé</p>
                ) : (
                  tags.map((tag) => (
                    <div
                      key={tag._id}
                      className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-full"
                    >
                      {editingTag === tag._id ? (
                        <TagEditForm
                          tag={tag}
                          onSave={(updatedData) => handleUpdateTag(tag._id, updatedData)}
                          onCancel={() => setEditingTag(null)}
                        />
                      ) : (
                        <>
                          <span className="text-sm font-medium">{tag.name}</span>
                          <button
                            onClick={() => setEditingTag(tag._id)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag._id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const CategoryEditForm = ({ category, onSave, onCancel, defaultColors }) => {
  const [editData, setEditData] = useState({
    name: category.name,
    color: category.color
  });

  const handleSave = () => {
    if (!editData.name.trim()) return;
    onSave(editData);
  };

  return (
    <div className="flex-1 flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1">
        <div className="flex space-x-1">
          {defaultColors.map((color) => (
            <button
              key={color}
              onClick={() => setEditData({ ...editData, color })}
              className={`w-6 h-6 rounded-full border transition-all ${
                editData.color === color 
                  ? 'border-gray-800 scale-110' 
                  : 'border-gray-300 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <input
          type="text"
          value={editData.name}
          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex items-center space-x-2 ml-3">
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:text-green-700 transition-colors"
        >
          <Save className="w-4 h-4" />
        </button>
        <button
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const TagEditForm = ({ tag, onSave, onCancel }) => {
  const [editData, setEditData] = useState({ name: tag.name });

  const handleSave = () => {
    if (!editData.name.trim()) return;
    onSave(editData);
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        value={editData.name}
        onChange={(e) => setEditData({ name: e.target.value })}
        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        style={{ width: '100px' }}
      />
      <button
        onClick={handleSave}
        className="text-green-600 hover:text-green-700 transition-colors"
      >
        <Save className="w-3 h-3" />
      </button>
      <button
        onClick={onCancel}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default Settings;
