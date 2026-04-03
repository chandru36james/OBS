import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Maximize2, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ScrollReveal from '../components/ScrollReveal';

const GalleryScreen = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const snap = await getDoc(doc(db, 'site_content', 'portfolio'));
        if (snap.exists()) {
          setContent(snap.data());
        }
      } catch (err) {
        console.error('Error fetching portfolio content:', err);
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

  const projects = (content?.projects && content.projects.length > 0) ? content.projects : [
    {
      id: '01',
      title: 'Ethereal Monolith',
      category: 'Modelling',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200',
      span: 'col-span-12 md:col-span-8',
      aspect: 'aspect-[16/10]',
      location: 'Lake Como, Italy',
      detailTitle: 'Ethereal Weddings at Lake Como',
      detailDescription: 'A visual narrative of timeless elegance, captured through the lens of quiet intimacy.',
      quote: '"Light is the only curator we trust."',
      detailImages: [
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: '02',
      title: 'The Gala',
      category: 'Wedding',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
      span: 'col-span-12 md:col-span-4 mt-12 md:mt-24',
      aspect: 'aspect-[3/4]',
      location: 'Paris, France',
      detailTitle: 'The Gala Night',
      detailDescription: 'A night of celebration and joy, captured with an editorial flair.',
      quote: '"Moments that last a lifetime."',
      detailImages: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1200'
      ]
    },
    {
      id: '03',
      title: 'Velvet Noir',
      category: 'Modelling',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
      span: 'col-span-12 md:col-span-4',
      aspect: 'aspect-[3/4]',
      location: 'Milan, Italy',
      detailTitle: 'Velvet Noir Editorial',
      detailDescription: 'High-fashion editorial shoot exploring textures and shadows.',
      quote: '"Fashion is an expression of the soul."',
      detailImages: [
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200'
      ]
    },
    {
      id: '04',
      title: 'Ivory Silence',
      category: 'Wedding',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200',
      span: 'col-span-12 md:col-span-8 md:-mt-24',
      aspect: 'aspect-[16/10]',
      location: 'Santorini, Greece',
      detailTitle: 'Ivory Silence in Santorini',
      detailDescription: 'A serene wedding shoot against the backdrop of the Aegean Sea.',
      quote: '"Silence speaks volumes."',
      detailImages: [
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1200'
      ]
    }
  ];

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter((p: any) => p.category === filter);

  const categories = ['All', ...new Set(projects.map((p: any) => p.category))];

  const openLightbox = (image: string) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto">
        <header className="mb-20">
          <ScrollReveal direction="right">
            <h1 className="font-headline italic text-7xl md:text-8xl tracking-tight text-on-surface leading-none mb-8">
              {content?.title || 'The Archive'}
            </h1>
          </ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <ScrollReveal delay={0.2}>
              <p className="font-body text-lg text-on-surface/70 max-w-xl leading-relaxed">
                {content?.subtitle || 'A curated selection of visual narratives exploring the intersection of light, luxury, and the human form.'}
              </p>
            </ScrollReveal>
            <nav className="flex flex-wrap gap-8 border-b border-outline-variant/20 pb-2">
              {categories.map((cat: any) => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`font-label text-xs uppercase tracking-[0.2rem] transition-all pb-2 border-b-2 ${
                    filter === cat ? 'text-primary border-primary' : 'text-on-surface/40 border-transparent hover:text-on-surface'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
        </header>
        
        <section className="grid grid-cols-12 gap-12">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div 
                layout
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className={`${project.span} group cursor-pointer`}
              >
                <div className="relative overflow-hidden bg-surface-container-low">
                  <img 
                    className={`w-full ${project.aspect} object-cover grayscale hover:grayscale-0 transition-all duration-700`} 
                    src={project.image} 
                    alt={project.title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(project.image);
                      }}
                      className="p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all"
                    >
                      <Maximize2 size={24} />
                    </button>
                    <button 
                      onClick={() => navigate(`/project-detail/${project.id}`)}
                      className="px-6 py-3 bg-white text-black font-label text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                      View Project
                    </button>
                  </div>
                </div>
                <div className="mt-6 flex justify-between items-baseline">
                  <div>
                    <span className="font-headline italic text-2xl text-on-surface">{project.id}</span>
                    <h3 className="inline-block ml-4 font-body font-medium text-lg uppercase tracking-widest text-on-surface">{project.title}</h3>
                  </div>
                  <span className="font-label text-[10px] uppercase tracking-[0.1rem] text-on-surface/50">{project.category} • {project.year}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </main>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={closeLightbox}
          >
            <button 
              onClick={closeLightbox}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2"
            >
              <X size={32} />
            </button>
            
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              src={selectedImage} 
              className="max-w-full max-h-full object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GalleryScreen;
