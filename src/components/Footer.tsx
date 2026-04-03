import React from 'react';
import { Instagram, Video, ExternalLink, Mail } from 'lucide-react';

const Footer = () => (
  <footer className="w-full py-24 px-8 mt-auto bg-surface-container-low flex flex-col items-center justify-center text-center">
    <div className="font-headline text-3xl text-on-surface mb-12">Singleframe</div>
    <div className="flex flex-wrap justify-center gap-12 mb-16">
      {[
        { name: 'Instagram', icon: <Instagram size={16} />, href: 'https://www.instagram.com/singleframe_photography/' },
        { name: 'Vimeo', icon: <Video size={16} />, href: '#' },
        { name: 'Behance', icon: <ExternalLink size={16} />, href: '#' },
        { name: 'Email', icon: <Mail size={16} />, href: 'mailto:contact@singleframe.photography' },
      ].map((social) => (
        <a
          key={social.name}
          className="flex items-center gap-2 font-label text-sm tracking-wide text-on-surface/60 hover:text-primary transition-all opacity-80 hover:opacity-100"
          href={social.href}
        >
          {social.icon}
          {social.name}
        </a>
      ))}
    </div>
    <div className="w-full max-w-4xl h-px bg-outline-variant/10 mb-12"></div>
    <p className="font-label text-xs tracking-widest text-on-surface/40 uppercase flex flex-col md:flex-row items-center justify-center gap-2">
      <span>© 2024 Singleframe Photography. All Rights Reserved.</span>

      <span>
        Designed by{" "}
        <a
          href="https://vgotyou.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-on-surface/50 hover:text-primary transition-all"
        >
          VGot You
        </a>
      </span>
    </p>
  </footer>
);

export default Footer;
