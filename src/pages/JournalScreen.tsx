import React from 'react';
import { motion } from 'motion/react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: any;
}

const JournalScreen = () => {
  const [articles, setArticles] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          where('status', '==', 'published'),
          orderBy('publishedAt', 'desc')
        );
        const snap = await getDocs(q);
        setArticles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      } catch (err) {
        console.error('Error fetching journal articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto">
        <header className="mb-32 text-center">
          <ScrollReveal direction="up">
            <h1 className="font-headline italic text-7xl md:text-9xl tracking-tight text-on-surface leading-none mb-8">The Journal</h1>
            <p className="font-body text-xl text-on-surface/60 max-w-2xl mx-auto">Reflections on the craft, the light, and the stories behind the lens.</p>
          </ScrollReveal>
        </header>

        <section className="space-y-48">
          {articles.map((article, idx) => (
            <ScrollReveal key={article.id} direction={idx % 2 === 0 ? 'left' : 'right'} className={`grid grid-cols-1 md:grid-cols-12 gap-12 items-center ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
              <div className={`md:col-span-7 ${idx % 2 !== 0 ? 'md:order-2' : ''}`}>
                <Link to={`/journal/${article.slug}`}>
                  <div className="aspect-[16/9] overflow-hidden bg-surface-container-low grayscale hover:grayscale-0 transition-all duration-1000">
                    <img 
                      src={article.coverImage || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800'} 
                      alt={article.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </Link>
              </div>
              <div className={`md:col-span-5 ${idx % 2 !== 0 ? 'md:order-1' : ''}`}>
                <span className="font-label text-xs uppercase tracking-[0.3rem] text-primary mb-4 block">
                  {article.publishedAt?.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <Link to={`/journal/${article.slug}`}>
                  <h2 className="font-headline text-4xl md:text-5xl mb-6 leading-tight hover:text-primary transition-colors cursor-pointer">{article.title}</h2>
                </Link>
                <p className="font-body text-lg text-on-surface/70 mb-8 leading-relaxed">{article.excerpt}</p>
                <Link to={`/journal/${article.slug}`}>
                  <button className="font-label text-[10px] uppercase tracking-[0.2rem] border-b border-outline-variant hover:border-primary transition-all pb-2">Read Article</button>
                </Link>
              </div>
            </ScrollReveal>
          ))}
          {articles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-on-surface/40 italic serif text-2xl">No journal entries yet. Check back soon.</p>
            </div>
          )}
        </section>
      </main>
    </motion.div>
  );
};

export default JournalScreen;
