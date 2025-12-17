'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Package, 
  Loader2,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Image as ImageIcon
} from 'lucide-react';

interface Meuble {
  id: string;
  nom: string;
  categorie_id: string;
  categorie_nom: string;
  volume_m3: number;
  poids_kg: number | null;
  image_url: string | null;
  ordre: number;
  actif: boolean;
}

interface Categorie {
  id: string;
  nom: string;
}

export default function AdminMeublesPage() {
  const router = useRouter();
  const [meubles, setMeubles] = useState<Meuble[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Meuble>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeuble, setNewMeuble] = useState({
    nom: '',
    categorie_id: '',
    volume_m3: 0,
    poids_kg: 0,
    image_url: '',
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      if (data.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchData();
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchData = async () => {
    try {
      const [meublesRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/meubles'),
        fetch('/api/admin/categories'),
      ]);
      
      if (meublesRes.ok) {
        const data = await meublesRes.json();
        setMeubles(data.meubles);
      }
      
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeubles = meubles.filter(m => {
    const matchSearch = m.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategorie = !filterCategorie || m.categorie_id === filterCategorie;
    return matchSearch && matchCategorie;
  });

  const startEdit = (meuble: Meuble) => {
    setEditing(meuble.id);
    setEditForm({
      nom: meuble.nom,
      volume_m3: meuble.volume_m3,
      poids_kg: meuble.poids_kg,
      actif: meuble.actif,
    });
  };

  const saveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/meubles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      
      if (response.ok) {
        setMeubles(meubles.map(m => 
          m.id === id ? { ...m, ...editForm } : m
        ));
        setEditing(null);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const addMeuble = async () => {
    try {
      const response = await fetch('/api/admin/meubles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeuble),
      });
      
      if (response.ok) {
        fetchData();
        setShowAddForm(false);
        setNewMeuble({
          nom: '',
          categorie_id: '',
          volume_m3: 0,
          poids_kg: 0,
          image_url: '',
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const deleteMeuble = async (id: string) => {
    if (!confirm('Supprimer ce meuble?')) return;
    
    try {
      const response = await fetch(`/api/admin/meubles/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setMeubles(meubles.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-5 h-5" />
                Retour
              </Link>
              <h1 className="ml-4 text-xl font-bold text-slate-800">Catalogue de meubles</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un meuble..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <select
            value={filterCategorie}
            onChange={(e) => setFilterCategorie(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nom}</option>
            ))}
          </select>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Nouveau meuble</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Nom du meuble"
                value={newMeuble.nom}
                onChange={(e) => setNewMeuble({ ...newMeuble, nom: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <select
                value={newMeuble.categorie_id}
                onChange={(e) => setNewMeuble({ ...newMeuble, categorie_id: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nom}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Volume m³"
                step="0.01"
                value={newMeuble.volume_m3 || ''}
                onChange={(e) => setNewMeuble({ ...newMeuble, volume_m3: parseFloat(e.target.value) })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                placeholder="Poids kg"
                value={newMeuble.poids_kg || ''}
                onChange={(e) => setNewMeuble({ ...newMeuble, poids_kg: parseInt(e.target.value) })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={addMeuble}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des meubles */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Image</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Nom</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Catégorie</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Volume</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Poids</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Statut</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMeubles.map((meuble) => (
                <tr key={meuble.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3">
                    {meuble.image_url ? (
                      <img 
                        src={meuble.image_url} 
                        alt={meuble.nom}
                        className="w-12 h-12 object-contain bg-slate-100 rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {editing === meuble.id ? (
                      <input
                        type="text"
                        value={editForm.nom || ''}
                        onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                        className="px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    ) : (
                      <span className="font-medium text-slate-800">{meuble.nom}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    {meuble.categorie_nom}
                  </td>
                  <td className="px-6 py-3 text-center">
                    {editing === meuble.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.volume_m3 || ''}
                        onChange={(e) => setEditForm({ ...editForm, volume_m3: parseFloat(e.target.value) })}
                        className="w-20 px-2 py-1 border border-slate-300 rounded text-sm text-center"
                      />
                    ) : (
                      <span className="font-medium">{meuble.volume_m3} m³</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-center text-sm text-slate-600">
                    {meuble.poids_kg ? `${meuble.poids_kg} kg` : '-'}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      meuble.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {meuble.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    {editing === meuble.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => saveEdit(meuble.id)}
                          className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(meuble)}
                          className="p-1 hover:bg-slate-100 rounded"
                        >
                          <Edit className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          onClick={() => deleteMeuble(meuble.id)}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredMeubles.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              Aucun meuble trouvé
            </div>
          )}
        </div>
      </div>
    </div>
  );
}







