import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ScrollReveal from '../components/ScrollReveal';
import { Loader2 } from 'lucide-react';

const AboutScreen = () => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const snap = await getDoc(doc(db, 'site_content', 'about'));
        if (snap.exists()) {
          setContent(snap.data());
        }
      } catch (err) {
        console.error('Error fetching about content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-neutral-900" size={48} />
      </div>
    );
  }

  const data = content ? {
    hero: {
      title: content.hero?.title || "The Soul <br/> <span className=\"pl-24\">Behind</span> <br/> The Lens.",
      subtitle: content.hero?.subtitle || "\"Photography is not an observation, but an encounter between two souls, mediated by light.\"",
      author: content.hero?.author || "Elias Thorne, Founder",
      image: content.hero?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800"
    },
    philosophy: {
      title: content.philosophy?.title || "Philosophy",
      description: content.philosophy?.description || "<p>At The Obsidian, we reject the digital perfection of modern photography. We chase the grain, the shadow, and the unposed moment that reveals a deeper truth.</p><p>Our approach is architectural. We look at the human form and the landscape as structures of light.</p>",
      image: content.philosophy?.image || "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?auto=format&fit=crop&q=80&w=800"
    }
  } : {
    hero: {
      title: "The Soul <br/> <span className=\"pl-24\">Behind</span> <br/> The Lens.",
      subtitle: "\"Photography is not an observation, but an encounter between two souls, mediated by light.\"",
      author: "Elias Thorne, Founder",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800"
    },
    philosophy: {
      title: "Philosophy",
      description: "<p>At The Obsidian, we reject the digital perfection of modern photography. We chase the grain, the shadow, and the unposed moment that reveals a deeper truth.</p><p>Our approach is architectural. We look at the human form and the landscape as structures of light.</p>",
      image: "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?auto=format&fit=crop&q=80&w=800"
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <main className="pt-32 pb-24">
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-12 gap-12 items-end mb-48">
          <div className="md:col-span-7 relative">
            <ScrollReveal direction="left">
              <h1 
                className="text-7xl md:text-9xl font-headline italic tracking-tighter leading-none mb-12 relative z-10"
                dangerouslySetInnerHTML={{ __html: data.hero.title }}
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.3} className="bg-surface-container-low p-12 relative -mt-12 ml-12">
              <p className="font-headline text-2xl italic text-on-surface/80 leading-relaxed max-w-lg">
                {data.hero.subtitle}
              </p>
            </ScrollReveal>
          </div>
          <ScrollReveal direction="right" delay={0.5} className="md:col-span-5">
            <img 
              className="w-full aspect-[4/5] object-cover grayscale shadow-editorial-shadow" 
              src={data.hero.image} 
              alt={data.hero.author}
              referrerPolicy="no-referrer"
            />
            <div className="mt-6 flex justify-between items-baseline">
              <span className="font-headline text-5xl italic text-primary">01</span>
              <span className="font-label text-xs uppercase tracking-[0.2rem] text-on-surface/40">{data.hero.author}</span>
            </div>
          </ScrollReveal>
        </section>

        <section className="bg-surface-container-low py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-32 items-start">
              <ScrollReveal direction="left">
                <h2 className="font-headline text-5xl mb-12">{data.philosophy.title}</h2>
                <div 
                  className="space-y-8 font-body text-lg leading-relaxed text-on-surface/70"
                  dangerouslySetInnerHTML={{ __html: data.philosophy.description }}
                />
              </ScrollReveal>
              <ScrollReveal direction="right" delay={0.2} className="relative pt-24">
                <div className="absolute -top-12 -left-12 font-headline text-[12rem] text-on-surface/5 leading-none select-none">The Obsidian</div>
                <img 
                  className="w-full aspect-square object-cover relative z-10 grayscale" 
                  src={data.philosophy.image} 
                  alt="Philosophy study"
                  referrerPolicy="no-referrer"
                />
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
    </motion.div>
  );
};

export default AboutScreen;
