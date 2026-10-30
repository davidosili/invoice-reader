import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SSR_DIR = path.join(ROOT_DIR, 'dist-ssr');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');
const SHELL_PATH = path.join(DIST_DIR, '_app_shell.html');

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function prerender() {
  console.log('\n[LedgerLens Prerender] Starting static HTML generation...');

  if (!fs.existsSync(TEMPLATE_PATH) && !fs.existsSync(SHELL_PATH)) {
    throw new Error(`Production template not found at ${TEMPLATE_PATH}. Run "vite build" first.`);
  }

  // Preserve clean app shell template
  let template;
  if (fs.existsSync(SHELL_PATH)) {
    template = fs.readFileSync(SHELL_PATH, 'utf-8');
  } else {
    template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
    if (!template.includes('<div id="root"></div>')) {
      throw new Error('Template is missing empty <div id="root"></div> placeholder.');
    }
    fs.writeFileSync(SHELL_PATH, template, 'utf-8');
  }

  // 1. Build SSR bundle
  console.log('[LedgerLens Prerender] Compiling SSR bundle with Vite...');
  await build({
    build: {
      ssr: 'src/entry-server.tsx',
      outDir: 'dist-ssr',
      emptyOutDir: true,
      logLevel: 'warn',
    },
    configFile: path.join(ROOT_DIR, 'vite.config.ts'),
  });

  // 2. Import compiled entry-server module
  const entryServerPath = path.join(SSR_DIR, 'entry-server.js');
  if (!fs.existsSync(entryServerPath)) {
    throw new Error(`SSR bundle not found at ${entryServerPath}`);
  }

  const entryServerUrl = pathToFileURL(entryServerPath).href;
  const { render, ROUTE_METADATA } = await import(entryServerUrl);

  const routes = ['/', '/privacy', '/terms', '/about', '/pricing'];
  console.log(`[LedgerLens Prerender] Pre-rendering ${routes.length} public routes: ${routes.join(', ')}`);

  for (const route of routes) {
    const { html, meta } = render(route);

    let pageHtml = template;

    // Inject rendered application into root container
    pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

    // Replace <title>
    pageHtml = pageHtml.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);

    // Replace meta description
    if (/<meta\s+name=["']description["']/i.test(pageHtml)) {
      pageHtml = pageHtml.replace(
        /<meta\s+name=["']description["'][^>]*>/i,
        `<meta name="description" content="${escapeHtml(meta.description)}" />`
      );
    } else {
      pageHtml = pageHtml.replace('</head>', `  <meta name="description" content="${escapeHtml(meta.description)}" />\n  </head>`);
    }

    // Canonical link
    if (/<link\s+rel=["']canonical["']/i.test(pageHtml)) {
      pageHtml = pageHtml.replace(
        /<link\s+rel=["']canonical["'][^>]*>/i,
        `<link rel="canonical" href="${meta.canonical}" />`
      );
    } else {
      pageHtml = pageHtml.replace('</head>', `  <link rel="canonical" href="${meta.canonical}" />\n  </head>`);
    }

    // Open Graph meta
    if (/<meta\s+property=["']og:title["']/i.test(pageHtml)) {
      pageHtml = pageHtml.replace(
        /<meta\s+property=["']og:title["'][^>]*>/i,
        `<meta property="og:title" content="${escapeHtml(meta.title)}" />`
      );
    } else {
      pageHtml = pageHtml.replace('</head>', `  <meta property="og:title" content="${escapeHtml(meta.title)}" />\n  </head>`);
    }

    if (/<meta\s+property=["']og:description["']/i.test(pageHtml)) {
      pageHtml = pageHtml.replace(
        /<meta\s+property=["']og:description["'][^>]*>/i,
        `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
      );
    } else {
      pageHtml = pageHtml.replace('</head>', `  <meta property="og:description" content="${escapeHtml(meta.description)}" />\n  </head>`);
    }

    if (/<meta\s+property=["']og:url["']/i.test(pageHtml)) {
      pageHtml = pageHtml.replace(
        /<meta\s+property=["']og:url["'][^>]*>/i,
        `<meta property="og:url" content="${meta.canonical}" />`
      );
    } else {
      pageHtml = pageHtml.replace('</head>', `  <meta property="og:url" content="${meta.canonical}" />\n  </head>`);
    }

    if (route === '/') {
      fs.writeFileSync(path.join(DIST_DIR, 'index.html'), pageHtml, 'utf-8');
      console.log(`  ✓ Generated / -> dist/index.html (${pageHtml.length} bytes)`);
    } else {
      const cleanSlug = route.replace(/^\//, '');
      const routeDir = path.join(DIST_DIR, cleanSlug);
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      fs.writeFileSync(path.join(routeDir, 'index.html'), pageHtml, 'utf-8');
      fs.writeFileSync(path.join(DIST_DIR, `${cleanSlug}.html`), pageHtml, 'utf-8');
      console.log(`  ✓ Generated ${route} -> dist/${cleanSlug}/index.html & dist/${cleanSlug}.html (${pageHtml.length} bytes)`);
    }
  }

  // 3. Clean up SSR bundle directory
  fs.rmSync(SSR_DIR, { recursive: true, force: true });
  console.log('[LedgerLens Prerender] Pre-rendering completed successfully. Temporary SSR artifacts cleaned up.\n');
}

prerender().catch((err) => {
  console.error('[LedgerLens Prerender Error]:', err);
  process.exit(1);
});
