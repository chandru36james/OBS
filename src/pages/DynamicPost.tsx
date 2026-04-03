import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SEO } from '../components/SEO';
import { ArrowLeft, Calendar, User } from 'lucide-react';

export const DynamicPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      const q = query(collection(db, 'posts'), where('slug', '==', slug), where('status', '==', 'published'), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setPost(snap.docs[0].data());
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-neutral-900"></div></div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center text-2xl font-bold italic serif">Post Not Found</div>;

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto font-sans">
      <SEO 
        title={post.seo?.title || post.title}
        description={post.seo?.description || post.excerpt}
        keywords={post.seo?.keywords}
        image={post.coverImage}
        type="article"
      />
      
      <Link to="/journal" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-8 group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-widest">Back to Journal</span>
      </Link>

      {post.coverImage && (
        <div className="aspect-[21/9] w-full mb-12 rounded-2xl overflow-hidden">
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className="flex items-center gap-6 mb-6 text-neutral-400 text-xs font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>{post.publishedAt?.toDate().toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={14} />
          <span>Editorial Team</span>
        </div>
      </div>

      <h1 className="text-6xl font-bold italic serif mb-12 text-neutral-900 leading-tight">{post.title}</h1>
      
      <div 
        className="prose prose-neutral max-w-none prose-headings:serif prose-headings:italic prose-p:text-lg prose-p:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
};
