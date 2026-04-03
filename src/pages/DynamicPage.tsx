import React from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SEO } from '../components/SEO';

export const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      const q = query(collection(db, 'pages'), where('slug', '==', slug), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setPage(snap.docs[0].data());
      }
      setLoading(false);
    };
    fetchPage();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-neutral-900"></div></div>;
  if (!page) return <div className="min-h-screen flex items-center justify-center text-2xl font-bold italic serif">Page Not Found</div>;

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto font-sans">
      <SEO 
        title={page.seo?.title || page.title}
        description={page.seo?.description}
        keywords={page.seo?.keywords}
      />
      <h1 className="text-6xl font-bold italic serif mb-12 text-neutral-900">{page.title}</h1>
      <div 
        className="prose prose-neutral max-w-none prose-headings:serif prose-headings:italic"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
};
