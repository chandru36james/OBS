import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import puppeteer from "puppeteer";
import { db } from "./src/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { brochureRouter } from "./server/routes/brochure.routes";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Adjusted for development
  }));

  // CORS Configuration
  const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "https://ais-dev-pxtvt2ysnc7pmfws36dhub-274935142024.asia-southeast1.run.app",
    "https://ais-pre-pxtvt2ysnc7pmfws36dhub-274935142024.asia-southeast1.run.app"
  ].filter(Boolean) as string[];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));

  app.use(express.json());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api/", limiter);

  // Use the new brochure router
  app.use("/api/brochure", brochureRouter);

  // Sitemap Generator
  app.get("/sitemap.xml", async (req, res) => {
    console.log("Generating sitemap...");
    try {
      let baseUrl = process.env.CLIENT_URL || process.env.APP_URL;
      if (!baseUrl) {
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host || 'localhost:3000';
        baseUrl = `${protocol}://${host}`;
      }
      
      baseUrl = baseUrl.replace(/\/$/, '');
      
      const [pagesSnap, postsSnap, portfolioSnap] = await Promise.all([
        getDocs(collection(db, 'pages')),
        getDocs(query(collection(db, 'posts'), where('status', '==', 'published'))),
        getDocs(collection(db, 'site_content'))
      ]);
      
      const portfolioDoc = portfolioSnap.docs.find(doc => doc.id === 'portfolio');
      const portfolioData = portfolioDoc?.data() || {};
      const projects = portfolioData.projects || [];

      const dynamicPages = pagesSnap.docs.map(doc => {
        const data = doc.data();
        return { url: `/p/${data.slug}`, priority: '0.7' };
      }).filter(p => p.url !== '/p/undefined' && p.url !== '/p/');

      const dynamicPosts = postsSnap.docs.map(doc => {
        const data = doc.data();
        return { url: `/journal/${data.slug}`, priority: '0.6' };
      }).filter(p => p.url !== '/journal/undefined' && p.url !== '/journal/');

      const projectPages = projects.map((project: any) => ({
        url: `/project-detail/${project.id}`,
        priority: '0.6'
      }));

      const staticRoutes = [
        { url: '', priority: '1.0' },
        { url: '/services', priority: '0.8' },
        { url: '/journal', priority: '0.8' },
        { url: '/contact', priority: '0.8' },
        { url: '/about', priority: '0.8' },
        { url: '/gallery', priority: '0.8' }
      ];

      const allRoutes = [...staticRoutes, ...dynamicPages, ...dynamicPosts, ...projectPages];
      
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes.map(route => `
  <url>
    <loc>${baseUrl}${route.url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('')}
</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error("Sitemap Error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // API Route for PDF Generation (REPLACED BY /api/brochure/generate)
  // ... (old code removed)

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();

