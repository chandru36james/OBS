import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SEO } from '../components/SEO';
import { toast } from 'sonner';

const ContactScreen = () => {
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: '',
    message: ''
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const snap = await getDoc(doc(db, 'site_content', 'contact'));
        if (snap.exists()) {
          setContent(snap.data());
        }
      } catch (err) {
        console.error('Error fetching contact content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    
    try {
      await addDoc(collection(db, 'leads'), {
        name: formData.name,
        mobile: formData.phone,
        projectType: formData.type || 'General Inquiry',
        message: formData.message,
        status: 'new',
        createdAt: serverTimestamp(),
        source: 'contact_form'
      });
      
      setFormStatus('sent');
      toast.success('Inquiry sent successfully!');
    } catch (error) {
      console.error('Error saving lead:', error);
      setFormStatus('idle');
      toast.error('Failed to send inquiry. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-neutral-900" size={48} />
      </div>
    );
  }

  const defaults = {
    title: "Let's capture <br /> the <span className=\"text-primary\">unseen</span>.",
    description: "The Obsidian is a boutique studio specializing in high-contrast editorial photography.",
    address: "Chennai 600017",
    whatsapp: "https://wa.me/919000000000",
    phone: "+91 90000 00000",
    email: "studio@singleframe.in"
  };

  const data = content ? {
    title: content.title || defaults.title,
    description: content.description || defaults.description,
    address: content.address || defaults.address,
    whatsapp: content.whatsapp || defaults.whatsapp,
    phone: content.phone || defaults.phone,
    email: content.email || defaults.email
  } : defaults;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <SEO 
        title="Contact" 
        description="Get in touch with Singleframe. Let's discuss your next high-impact visual project."
        keywords="contact photography studio, book photographer, creative consultation"
      />
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 flex flex-col gap-12">
            <section>
              <h1 
                className="font-headline text-6xl md:text-7xl italic leading-tight tracking-tight mb-8"
                dangerouslySetInnerHTML={{ __html: data.title }}
              />
              <p className="font-body text-lg text-on-surface/70 leading-relaxed max-w-md">
                {data.description}
              </p>
            </section>
            <div className="space-y-8">
              <div>
                <span className="font-label text-[10px] uppercase tracking-[0.2rem] text-primary block mb-2">The Studio</span>
                <address className="not-italic font-headline text-2xl text-on-surface"> {data.address}</address>
              </div>

              {data.phone && (
                <div>
                  <span className="font-label text-[10px] uppercase tracking-[0.2rem] text-primary block mb-2">Phone</span>
                  <p className="font-headline text-2xl text-on-surface">{data.phone}</p>
                </div>
              )}

              {data.email && (
                <div>
                  <span className="font-label text-[10px] uppercase tracking-[0.2rem] text-primary block mb-2">Email</span>
                  <p className="font-headline text-2xl text-on-surface">{data.email}</p>
                </div>
              )}

              <a 
                className="inline-flex items-center gap-3 bg-primary text-on-primary px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-primary-container transition-colors shadow-lg" 
                href={data.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} />
                Instant Inquiry (WhatsApp)
              </a>
            </div>
          </div>
          <div className="lg:col-span-7 bg-surface-container-low p-8 md:p-12 relative shadow-editorial-shadow">
            <div className="absolute -top-6 -left-6 font-headline text-8xl text-on-surface/5 select-none pointer-events-none italic">Inquiry</div>
            {formStatus === 'sent' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <CheckCircle2 className="text-primary mb-4" size={64} />
                <h3 className="font-headline text-3xl mb-2">Message Captured</h3>
                <p className="text-on-surface/60">Our curators will reach out within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <input 
                    required 
                    className="w-full bg-transparent border-0 border-b border-outline/30 py-4 focus:ring-0 focus:border-primary transition-all placeholder:text-on-surface/30 font-body text-lg" 
                    placeholder="Full Name" 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <input 
                    required 
                    className="w-full bg-transparent border-0 border-b border-outline/30 py-4 focus:ring-0 focus:border-primary transition-all placeholder:text-on-surface/30 font-body text-lg" 
                    placeholder="Phone Number" 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-outline/30 py-4 focus:ring-0 focus:border-primary transition-all font-body text-lg text-on-surface/60 appearance-none"
                >
                  <option value="">Select Shoot Type</option>
                  <option value="editorial">Editorial Fashion</option>
                  <option value="portrait">Artistic Portrait</option>
                  <option value="commercial">Commercial Campaign</option>
                </select>
                <textarea 
                  required 
                  className="w-full bg-transparent border-0 border-b border-outline/30 py-4 focus:ring-0 focus:border-primary transition-all placeholder:text-on-surface/30 font-body text-lg resize-none" 
                  placeholder="Briefly describe your vision" 
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="font-label text-[10px] uppercase tracking-[0.1rem] text-on-surface/40">Studio: Open for booking</span>
                  </div>
                  <button
                    disabled={formStatus === 'sending'}
                    className="group flex items-center gap-4 text-on-surface font-label text-xs uppercase tracking-[0.2rem] font-bold"
                    type="submit"
                  >
                    {formStatus === 'sending' ? 'Sending...' : 'Send Request'}
                    <ArrowRight className="group-hover:translate-x-2 transition-transform" size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default ContactScreen;
