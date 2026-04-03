import React from 'react';
import { collection, getDocs, addDoc, setDoc, doc, serverTimestamp, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FileText, Users, Eye, TrendingUp, Database, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState({
    pages: 0,
    posts: 0,
    views: 1240, // Mock for now
    users: 1
  });
  const [seeding, setSeeding] = React.useState(false);
  const [cleaning, setCleaning] = React.useState(false);

  const fetchStats = async () => {
    const pagesSnap = await getDocs(collection(db, 'pages'));
    const postsSnap = await getDocs(collection(db, 'posts'));
    setStats(prev => ({
      ...prev,
      pages: pagesSnap.size,
      posts: postsSnap.size
    }));
  };

  const cleanupDuplicates = async () => {
    if (!window.confirm('This will delete all duplicate journal entries and pages, keeping only the oldest version of each slug. Proceed?')) return;
    setCleaning(true);
    try {
      const postsSnap = await getDocs(collection(db, 'posts'));
      const posts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const postGroups: Record<string, any[]> = {};
      posts.forEach(p => {
        if (!postGroups[p.slug]) postGroups[p.slug] = [];
        postGroups[p.slug].push(p);
      });

      let postDeleted = 0;
      for (const slug in postGroups) {
        const group = postGroups[slug];
        if (group.length > 1) {
          group.sort((a, b) => (a.updatedAt?.toMillis() || 0) - (b.updatedAt?.toMillis() || 0));
          const toDelete = group.slice(1);
          for (const p of toDelete) {
            await deleteDoc(doc(db, 'posts', p.id));
            postDeleted++;
          }
        }
      }

      const pagesSnap = await getDocs(collection(db, 'pages'));
      const pages = pagesSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const pageGroups: Record<string, any[]> = {};
      pages.forEach(p => {
        if (!pageGroups[p.slug]) pageGroups[p.slug] = [];
        pageGroups[p.slug].push(p);
      });

      let pageDeleted = 0;
      for (const slug in pageGroups) {
        const group = pageGroups[slug];
        if (group.length > 1) {
          group.sort((a, b) => (a.updatedAt?.toMillis() || 0) - (b.updatedAt?.toMillis() || 0));
          const toDelete = group.slice(1);
          for (const p of toDelete) {
            await deleteDoc(doc(db, 'pages', p.id));
            pageDeleted++;
          }
        }
      }

      toast.success(`Cleanup complete! Removed ${postDeleted} duplicate posts and ${pageDeleted} duplicate pages.`);
      fetchStats();
    } catch (err) {
      console.error('Cleanup error:', err);
      toast.error('Failed to cleanup duplicates');
    } finally {
      setCleaning(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  const seedData = async () => {
    setSeeding(true);
    try {
      // Sample Journal Entries
      const samplePosts = [
        {
          title: "Minimalist Photography Techniques for High-Impact Visuals",
          slug: "minimalist-photography-techniques",
          excerpt: "Discover how to use negative space and simple compositions to create powerful, high-impact minimalist photography.",
          content: `
            <h2>The Power of Less</h2>
            <p>In a world saturated with visual noise, minimalism stands out by saying more with less. Minimalist photography isn't just about empty space; it's about intentionality.</p>
            <h3>1. Embrace Negative Space</h3>
            <p>Negative space is the area surrounding the main subject. By giving your subject room to breathe, you draw the viewer's eye directly to what matters most.</p>
            <h3>2. Focus on Geometry</h3>
            <p>Lines, circles, and triangles provide a strong structural foundation for minimalist shots. Look for architectural details or natural patterns.</p>
            <p><strong>SEO Tip:</strong> Use descriptive alt text for your minimalist images to rank for specific aesthetic keywords.</p>
          `,
          coverImage: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200",
          status: "published",
          seo: {
            title: "Minimalist Photography Guide | High-Impact Visuals",
            description: "Learn professional minimalist photography techniques using negative space and geometric composition.",
            keywords: "minimalist photography, negative space, photography composition, visual storytelling"
          }
        },
        {
          title: "Mastering Natural Light: The Ultimate Guide for Professional Results",
          slug: "mastering-natural-light-guide",
          excerpt: "Learn the secrets of using natural light to enhance your photography, from golden hour tips to indoor lighting techniques.",
          content: `
            <h2>Chasing the Sun</h2>
            <p>Light is the most critical element in photography. While studio lights offer control, natural light offers a soul and texture that is hard to replicate.</p>
            <h3>The Golden Hour</h3>
            <p>Occurring shortly after sunrise and before sunset, the golden hour provides a warm, soft glow that eliminates harsh shadows.</p>
            <h3>Window Light Mastery</h3>
            <p>Windows act as natural softboxes. Position your subject at a 45-degree angle to the window for classic, flattering Rembrandt lighting.</p>
          `,
          coverImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200",
          status: "published",
          seo: {
            title: "Natural Light Photography Guide | Professional Results",
            description: "Master natural light photography with our comprehensive guide on golden hour and indoor lighting.",
            keywords: "natural light photography, golden hour, lighting techniques, professional photography"
          }
        },
        {
          title: "Cinematic Visuals: How to Achieve a Film Look in Digital Video",
          slug: "cinematic-visuals-digital-video",
          excerpt: "A deep dive into color grading, lighting, and composition techniques to achieve a professional cinematic film look in digital video.",
          content: `
            <h2>Beyond the Resolution</h2>
            <p>Cinematic isn't a resolution; it's a feeling. Achieving a film look requires a combination of technical choices and artistic vision.</p>
            <h3>Aspect Ratios and Composition</h3>
            <p>Using a 2.35:1 widescreen aspect ratio can immediately signal a cinematic intent. Combine this with the rule of thirds or center framing for impact.</p>
            <h3>Color Grading</h3>
            <p>The "Teal and Orange" look is a classic, but true cinematic grading is about supporting the narrative mood through color temperature and contrast.</p>
          `,
          coverImage: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&q=80&w=1200",
          status: "published",
          seo: {
            title: "How to Get a Cinematic Film Look | Digital Video Tips",
            description: "Achieve professional cinematic visuals in your digital videos with these color grading and lighting tips.",
            keywords: "cinematic visuals, film look, digital video production, color grading"
          }
        },
        {
          title: "Building a Strong Visual Brand Identity in 2024",
          slug: "visual-brand-identity-2024",
          excerpt: "Why visual consistency is key to brand success and how to build a compelling visual identity that resonates with your audience.",
          content: `
            <h2>The Visual Language of Business</h2>
            <p>Your brand is more than a logo; it's the sum of every visual touchpoint a customer interacts with.</p>
            <h3>Consistency is King</h3>
            <p>Using a consistent color palette and typography across all platforms builds trust and recognition.</p>
            <h3>Photography Style</h3>
            <p>Custom photography that reflects your brand's values is far more effective than generic stock imagery.</p>
          `,
          coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
          status: "published",
          seo: {
            title: "Visual Brand Identity Strategy 2024 | Branding Tips",
            description: "Learn how to build a powerful visual brand identity that stands out in 2024.",
            keywords: "brand identity, visual branding, brand strategy, visual consistency"
          }
        },
        {
          title: "The Power of Candid Photography: Capturing Raw Human Emotion",
          slug: "candid-photography-emotion",
          excerpt: "Explore the art of candid photography and learn how to capture authentic, raw human emotions in every shot.",
          content: `
            <h2>The Unstaged Moment</h2>
            <p>Candid photography captures life as it happens, without the self-consciousness of a posed portrait.</p>
            <h3>Blending In</h3>
            <p>The best candid photographers are invisible. Use a longer lens or move quietly to capture subjects in their natural state.</p>
            <h3>Timing and Anticipation</h3>
            <p>Wait for the "decisive moment"—that split second where emotion and composition perfectly align.</p>
          `,
          coverImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=1200",
          status: "published",
          seo: {
            title: "Candid Photography Tips | Capturing Authentic Emotion",
            description: "Master the art of candid photography and learn to capture raw, authentic human moments.",
            keywords: "candid photography, street photography, emotional photography, authentic moments"
          }
        }
      ];

      // Sample Pages
      const samplePages = [
        {
          title: "Our Philosophy",
          slug: "philosophy",
          content: `
            <h1>Our Philosophy</h1>
            <p>At Singleframe, we believe that every image should tell a story that resonates. Our approach is rooted in the intersection of art and commerce.</p>
            <h2>Cinematic Realism</h2>
            <p>We strive for a look that is both grounded in reality and elevated by cinematic techniques.</p>
          `,
          seo: {
            title: "Our Philosophy | Singleframe Visual Studio",
            description: "Learn about the artistic philosophy and cinematic approach of Singleframe studio.",
            keywords: "photography philosophy, visual studio, cinematic realism"
          }
        },
        {
          title: "The Studio",
          slug: "studio",
          content: `
            <h1>The Studio</h1>
            <p>Located in the heart of the creative district, our studio is designed to be a sanctuary for creativity.</p>
            <h2>Equipment & Space</h2>
            <p>Equipped with the latest in digital and analog technology, we provide a versatile space for any production.</p>
          `,
          seo: {
            title: "The Studio | Professional Photography Space",
            description: "Explore our professional photography studio equipped for high-end productions.",
            keywords: "photography studio, creative space, production house"
          }
        }
      ];

      // Site Content (Home, Services, Contact)
      const siteContent = {
        home: {
          slides: [
            {
              id: 1,
              title: "Singleframe",
              subtitle: "— a boutique visual studio.",
              description: "We craft high-impact visual narratives for brands that refuse to blend in with unfiltered creativity and cinematic precision.",
              image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1920",
              cta: "Explore Archive"
            },
            {
              id: 2,
              title: "Curation",
              subtitle: "— the art of light.",
              description: "Exploring the architectural quality of light and the raw emotion of the subject through a lens of stark realism.",
              image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1920",
              cta: "View Collection"
            },
            {
              id: 3,
              title: "Narrative",
              subtitle: "— cinematic presence.",
              description: "Transcending the medium to capture the unseen moments that define identity and presence in the modern age.",
              image: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&q=80&w=1920",
              cta: "Our Philosophy"
            }
          ],
          featuredWorks: [
            {
              title: "The Ethereal Collection",
              tag: "Personal Series • 2024",
              img: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200",
            },
            {
              title: "Visionary Portraits",
              tag: "Editorial • 2023",
              img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800",
            },
            {
              title: "Noir Fashion",
              tag: "Campaign • 2024",
              img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800",
            },
            {
              title: "Architectural Light",
              tag: "Commercial • 2023",
              img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
            }
          ],
          testimonials: [
            {
              quote: "The Obsidian team captured the soul of our Chennai wedding perfectly. Their editorial eye is unmatched in South India.",
              author: "Ananya Iyer"
            },
            {
              quote: "Our brand campaign in Madurai looks like it belongs in a high-end global magazine. Absolutely breathtaking work.",
              author: "Karthik Raja"
            },
            {
              quote: "A truly professional team that understands the intersection of art and commercial appeal in the Indian market.",
              author: "Meera Krishnan"
            }
          ]
        },
        services: {
          hero: {
            title: "Artistry in <span className=\"text-primary\">Focus.</span>",
            description: "Beyond photography, we craft visual legacies in Chennai. The Obsidian provides a bespoke editorial approach to every frame, ensuring your narrative is preserved with cinematic gravity across Tamil Nadu."
          },
          sections: [
            {
              id: '01',
              title: "Couture Weddings",
              description: "Documenting the quiet, profound moments of union in Tamil Nadu with an editorial lens that transcends traditional wedding photography.",
              image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
              cta: "Explore the Vows",
              atmosphere: "We focus on the architectural beauty of the venue and the intimate chemistry of the couple, creating a portfolio that looks like a high-end monograph.",
              inclusions: "Full-day coverage, analog film highlights, and a hand-bound heirloom archive album."
            },
            {
              id: '02',
              title: "Editorial Fashion",
              description: "High-concept visual storytelling for Indian designers and publications that demand a distinct, avant-garde signature.",
              image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1200",
              cta: "View Campaigns",
              atmosphere: "Dramatic lighting, sharp compositions, and a focus on texture and movement to bring the designer's vision to life.",
              inclusions: "Full creative direction, professional lighting crew, and high-end retouching for publication."
            }
          ],
          celebrity: {
            title: "Celebrity Portraiture",
            description: "Intimate, high-contrast portraits that capture the raw presence and identity of the world's most compelling figures.",
            items: [
              { id: "01", label: "The Visionary", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800" },
              { id: "02", label: "The Muse", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800" },
              { id: "03", label: "The Icon", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800" }
            ]
          },
          product: {
            title: "Product & Luxury Still Life",
            description: "Elevating objects into icons through meticulous lighting and composition that highlights craftsmanship and desire.",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200",
            features: [
              { icon: "flare", label: "Precision Macro Detail" },
              { icon: "light_mode", label: "Custom Light Sculpting" },
              { icon: "diamond", label: "Luxury Texture Focus" }
            ]
          }
        },
        contact: {
          title: "Let's capture <br /> the <span className=\"text-primary\">unseen</span>.",
          description: "The Obsidian is a boutique studio specializing in high-contrast editorial photography.",
          address: "Chennai 600017",
          whatsapp: "https://wa.me/yournumber"
        }
      };

      // Add Site Content
      for (const [id, data] of Object.entries(siteContent)) {
        await setDoc(doc(db, 'site_content', id), {
          ...data,
          updatedAt: serverTimestamp()
        });
      }

      // Add Posts (Delete existing with same slug first to be absolutely sure)
      for (const post of samplePosts) {
        const q = query(collection(db, 'posts'), where('slug', '==', post.slug));
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
        await setDoc(doc(db, 'posts', post.slug), {
          ...post,
          publishedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          authorId: 'system'
        });
      }

      // Add Pages (Delete existing with same slug first)
      for (const page of samplePages) {
        const q = query(collection(db, 'pages'), where('slug', '==', page.slug));
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
        await setDoc(doc(db, 'pages', page.slug), {
          ...page,
          updatedAt: serverTimestamp(),
          authorId: 'system'
        });
      }

      toast.success('Sample content seeded successfully!');
      fetchStats();
    } catch (err) {
      console.error('Seeding error:', err);
      toast.error('Failed to seed sample content');
    } finally {
      setSeeding(false);
    }
  };

  const statCards = [
    { name: 'Pages', value: stats.pages, icon: FileText, color: 'bg-blue-500' },
    { name: 'Journal Entries', value: stats.posts, icon: FileText, color: 'bg-green-500' },
    { name: 'Total Views', value: stats.views, icon: Eye, color: 'bg-purple-500' },
    { name: 'Admins', value: stats.users, icon: Users, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold italic serif text-neutral-900">Dashboard Overview</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={cleanupDuplicates}
            disabled={cleaning}
            className="flex items-center gap-2 text-sm font-bold bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50 border border-red-100"
          >
            {cleaning ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {cleaning ? 'Cleaning...' : 'Cleanup Duplicates'}
          </button>
          <button 
            onClick={seedData}
            disabled={seeding}
            className="flex items-center gap-2 text-sm font-bold bg-neutral-100 text-neutral-600 px-4 py-2 rounded-lg hover:bg-neutral-200 transition-all disabled:opacity-50"
          >
            {seeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
            {seeding ? 'Seeding...' : 'Seed Sample Content'}
          </button>
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 bg-white px-4 py-2 rounded-lg border border-neutral-200">
            <TrendingUp size={16} className="text-green-500" />
            <span>Site performance is up 12%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white`}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-neutral-500 text-sm font-medium uppercase tracking-wider">{stat.name}</p>
            <p className="text-3xl font-bold text-neutral-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 pb-6 border-b border-neutral-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">New journal entry published</p>
                  <p className="text-xs text-neutral-500 mt-1">"The Future of Web Design" was published 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors text-left">
              <p className="font-bold text-sm">Create New Entry</p>
              <p className="text-xs text-neutral-500 mt-1">Write a new journal entry</p>
            </button>
            <button className="p-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors text-left">
              <p className="font-bold text-sm">Add New Page</p>
              <p className="text-xs text-neutral-500 mt-1">Create a static page</p>
            </button>
            <button className="p-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors text-left">
              <p className="font-bold text-sm">Site Settings</p>
              <p className="text-xs text-neutral-500 mt-1">Update global SEO</p>
            </button>
            <button className="p-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors text-left">
              <p className="font-bold text-sm">View Live Site</p>
              <p className="text-xs text-neutral-500 mt-1">Open in new tab</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
