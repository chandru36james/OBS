import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, GripVertical, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface NavItem {
  id?: string;
  label: string;
  path: string;
  order: number;
  visible: boolean;
}

const NavigationManager = () => {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NavItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await api.admin.navigation.list();
      setItems(data);
    } catch (error) {
      toast.error('Failed to load navigation items');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item: NavItem) => {
    try {
      if (item.id) {
        await api.admin.navigation.update(item.id, item);
        toast.success('Navigation item updated');
      } else {
        await api.admin.navigation.create(item);
        toast.success('Navigation item created');
        setIsAdding(false);
      }
      setEditingId(null);
      setEditForm(null);
      fetchItems();
    } catch (error) {
      toast.error('Failed to save navigation item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this navigation item?')) return;
    try {
      await api.admin.navigation.delete(id);
      toast.success('Navigation item deleted');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete navigation item');
    }
  };

  const startEdit = (item: NavItem) => {
    setEditingId(item.id!);
    setEditForm({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setIsAdding(false);
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-headline font-bold">Navigation Manager</h2>
          <p className="text-on-surface/60 text-sm">Control your site's main menu</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditForm({ label: '', path: '', order: items.length, visible: true });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      <div className="bg-surface border border-outline-variant/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-on-surface/5 border-b border-outline-variant/10">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface/40">Order</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface/40">Label</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface/40">Path</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface/40">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {isAdding && editForm && (
              <tr className="bg-primary/5">
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={editForm.order}
                    onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) })}
                    className="w-16 px-2 py-1 bg-surface border border-outline-variant/20 rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    placeholder="Label"
                    value={editForm.label}
                    onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                    className="w-full px-2 py-1 bg-surface border border-outline-variant/20 rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    placeholder="/path"
                    value={editForm.path}
                    onChange={(e) => setEditForm({ ...editForm, path: e.target.value })}
                    className="w-full px-2 py-1 bg-surface border border-outline-variant/20 rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setEditForm({ ...editForm, visible: !editForm.visible })}
                    className={`p-2 rounded-lg ${editForm.visible ? 'text-green-500' : 'text-on-surface/40'}`}
                  >
                    {editForm.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleSave(editForm)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg">
                      <Save size={18} />
                    </button>
                    <button onClick={cancelEdit} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <X size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {items.map((item) => (
              <tr key={item.id} className="hover:bg-on-surface/5 transition-colors">
                {editingId === item.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={editForm?.order}
                        onChange={(e) => setEditForm({ ...editForm!, order: parseInt(e.target.value) })}
                        className="w-16 px-2 py-1 bg-surface border border-outline-variant/20 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editForm?.label}
                        onChange={(e) => setEditForm({ ...editForm!, label: e.target.value })}
                        className="w-full px-2 py-1 bg-surface border border-outline-variant/20 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editForm?.path}
                        onChange={(e) => setEditForm({ ...editForm!, path: e.target.value })}
                        className="w-full px-2 py-1 bg-surface border border-outline-variant/20 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setEditForm({ ...editForm!, visible: !editForm?.visible })}
                        className={`p-2 rounded-lg ${editForm?.visible ? 'text-green-500' : 'text-on-surface/40'}`}
                      >
                        {editForm?.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleSave(editForm!)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg">
                          <Save size={18} />
                        </button>
                        <button onClick={cancelEdit} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 font-mono text-xs text-on-surface/40">{item.order}</td>
                    <td className="px-6 py-4 font-medium">{item.label}</td>
                    <td className="px-6 py-4 text-sm text-on-surface/60">{item.path}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.visible ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-on-surface/10 text-on-surface/40'
                      }`}>
                        {item.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                        {item.visible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(item)} className="p-2 text-on-surface/60 hover:bg-on-surface/10 rounded-lg transition">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.id!)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NavigationManager;
