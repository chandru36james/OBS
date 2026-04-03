import React from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { Plus, Edit2, Trash2, X, Save, Globe, Search, Loader2, Copy } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import { quillModules, quillFormats } from '../../lib/editor';
import { toast } from 'sonner';

interface SEOData {
  title: string;
  description: string;
  keywords: string;
}

interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  seo: SEOData;
  updatedAt: any;
  authorId: string;
}

export const PagesManager: React.FC = () => {
  const { user } = useAuth();
  const [pages, setPages] = React.useState<PageData[]>([]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState<PageData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const duplicateSlugs = React.useMemo(() => {
    const counts: Record<string, number> = {};
    pages.forEach(p => {
      counts[p.slug] = (counts[p.slug] || 0) + 1;
    });
    return Object.keys(counts).filter(slug => counts[slug] > 1);
  }, [pages]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'pages'));
      setPages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PageData)));
    } catch (err) {
      toast.error('Failed to load pages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPages();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPage || !user) return;

    setSaving(true);
    const { id, ...pageDataWithoutId } = currentPage;

    // Check for duplicate slug
    const isDuplicateSlug = pages.some(p => p.slug === currentPage.slug && p.id !== id);
    if (isDuplicateSlug) {
      toast.error(`The slug "/${currentPage.slug}" is already in use by another page.`);
      setSaving(false);
      return;
    }

    const data = {
      ...pageDataWithoutId,
      updatedAt: serverTimestamp(),
      authorId: user.uid
    };

    try {
      if (id) {
        await updateDoc(doc(db, 'pages', id), data);
        toast.success('Page updated successfully');
      } else {
        await addDoc(collection(db, 'pages'), data);
        toast.success('Page created successfully');
      }
      setIsEditing(false);
      setCurrentPage(null);
      fetchPages();
    } catch (err) {
      toast.error('Failed to save page');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    try {
      await deleteDoc(doc(db, 'pages', id));
      toast.success('Page deleted successfully');
      fetchPages();
    } catch (err) {
      toast.error('Failed to delete page');
      console.error(err);
    }
  };

  const handleDuplicate = (page: PageData) => {
    const duplicatedPage: PageData = {
      ...page,
      id: undefined,
      title: `${page.title} (Copy)`,
      slug: `${page.slug}-copy`,
      updatedAt: null,
    };
    setCurrentPage(duplicatedPage);
    setIsEditing(true);
    toast.info('Draft copy created. Review and save.');
  };

  const handleCleanupDuplicates = async () => {
    if (!window.confirm('This will delete all duplicate pages, keeping only the oldest version of each slug. Proceed?')) return;
    
    setLoading(true);
    try {
      const slugGroups: Record<string, PageData[]> = {};
      pages.forEach(p => {
        if (!slugGroups[p.slug]) slugGroups[p.slug] = [];
        slugGroups[p.slug].push(p);
      });

      let deletedCount = 0;
      for (const slug in slugGroups) {
        const group = slugGroups[slug];
        if (group.length > 1) {
          // Sort by updatedAt (oldest first)
          group.sort((a, b) => {
            const timeA = a.updatedAt?.toMillis() || 0;
            const timeB = b.updatedAt?.toMillis() || 0;
            return timeA - timeB;
          });

          // Keep the first one, delete the rest
          const toDelete = group.slice(1);
          for (const p of toDelete) {
            if (p.id) {
              await deleteDoc(doc(db, 'pages', p.id));
              deletedCount++;
            }
          }
        }
      }
      
      toast.success(`Cleanup complete. Removed ${deletedCount} duplicate pages.`);
      fetchPages();
    } catch (err) {
      toast.error('Failed to cleanup duplicates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-neutral-900"></div></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold italic serif text-neutral-900">Manage Pages</h1>
        <div className="flex gap-4">
          {duplicateSlugs.length > 0 && (
            <button 
              onClick={handleCleanupDuplicates}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-100 transition-all border border-red-100"
            >
              <Trash2 size={20} />
              Cleanup Duplicates
            </button>
          )}
          <button 
            onClick={() => {
              setCurrentPage({ title: '', slug: '', content: '', seo: { title: '', description: '', keywords: '' }, updatedAt: null, authorId: '' });
              setIsEditing(true);
            }}
            className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-neutral-800 transition-all"
          >
            <Plus size={20} />
            Create New Page
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-lg animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">{currentPage?.id ? 'Edit Page' : 'New Page'}</h2>
            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-neutral-100 rounded-full">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-wider">Page Title</label>
                <input 
                  type="text"
                  required
                  value={currentPage?.title}
                  onChange={e => setCurrentPage(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                  className="w-full p-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 outline-none transition-all text-neutral-900"
                  placeholder="e.g. About Us"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-wider">URL Slug</label>
                <div className="flex items-center gap-2 text-neutral-500 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                  <Globe size={18} />
                  <span>/</span>
                  <input 
                    type="text"
                    required
                    value={currentPage?.slug}
                    onChange={e => setCurrentPage(prev => prev ? ({ ...prev, slug: e.target.value }) : null)}
                    className="bg-transparent outline-none flex-1 text-neutral-900"
                    placeholder="about-us"
                  />
                </div>
              </div>

              <div className="quill-editor-container">
                <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-wider">Page Content</label>
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                  <ReactQuill 
                    theme="snow"
                    value={currentPage?.content}
                    onChange={content => setCurrentPage(prev => prev ? ({ ...prev, content }) : null)}
                    modules={quillModules}
                    formats={quillFormats}
                    className="h-[500px] text-neutral-900"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
                <div className="flex items-center gap-2 mb-6 text-neutral-900">
                  <Search size={20} />
                  <h3 className="font-bold uppercase tracking-wider text-sm">SEO Settings</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Meta Title</label>
                    <input 
                      type="text"
                      value={currentPage?.seo.title}
                      onChange={e => setCurrentPage(prev => prev ? ({ ...prev, seo: { ...prev.seo, title: e.target.value } }) : null)}
                      className="w-full p-3 rounded-lg border border-neutral-200 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Meta Description</label>
                    <textarea 
                      rows={4}
                      value={currentPage?.seo.description}
                      onChange={e => setCurrentPage(prev => prev ? ({ ...prev, seo: { ...prev.seo, description: e.target.value } }) : null)}
                      className="w-full p-3 rounded-lg border border-neutral-200 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Keywords</label>
                    <input 
                      type="text"
                      value={currentPage?.seo.keywords}
                      onChange={e => setCurrentPage(prev => prev ? ({ ...prev, seo: { ...prev.seo, keywords: e.target.value } }) : null)}
                      className="w-full p-3 rounded-lg border border-neutral-200 text-sm text-neutral-900"
                      placeholder="comma, separated, words"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white p-4 rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? 'Saving...' : 'Save Page'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="p-6 text-xs font-bold text-neutral-500 uppercase tracking-widest">Title</th>
                <th className="p-6 text-xs font-bold text-neutral-500 uppercase tracking-widest">Slug</th>
                <th className="p-6 text-xs font-bold text-neutral-500 uppercase tracking-widest">Last Updated</th>
                <th className="p-6 text-xs font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {duplicateSlugs.length > 0 && (
                <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
                  <p className="text-xs text-red-600 font-medium">
                    Warning: Multiple pages are using the same URL slugs: {duplicateSlugs.map(s => `/${s}`).join(', ')}
                  </p>
                </div>
              )}
              {pages.map((page) => (
                <tr key={page.id} className={`hover:bg-neutral-50 transition-colors ${duplicateSlugs.includes(page.slug) ? 'bg-red-50/30' : ''}`}>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-neutral-900">{page.title}</p>
                      {duplicateSlugs.includes(page.slug) && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Duplicate Slug</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-mono text-neutral-500 bg-neutral-100 px-2 py-1 rounded">/{page.slug}</span>
                  </td>
                  <td className="p-6 text-sm text-neutral-500">
                    {page.updatedAt?.toDate().toLocaleDateString()}
                  </td>
                  <td className="p-6 text-right space-x-2">
                    <button 
                      onClick={() => handleDuplicate(page)}
                      className="p-2 text-neutral-400 hover:text-blue-600 transition-colors"
                      title="Duplicate Page"
                    >
                      <Copy size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentPage(page);
                        setIsEditing(true);
                      }}
                      className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => page.id && handleDelete(page.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-neutral-500">
                    No pages found. Create your first page to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
