import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');
const ROBOTS_PATH = path.join(PUBLIC_DIR, 'robots.txt');

console.log('--- Soho Space SEO & Sitemap Validator ---');

// Pillar 1: Robots
console.log('\n[Pillar 1: Robots]');
if (fs.existsSync(ROBOTS_PATH)) {
    const robotsContent = fs.readFileSync(ROBOTS_PATH, 'utf8');
    if (robotsContent.includes('Sitemap:')) {
        console.log('✅ Sitemap URL is listed in robots.txt');
    } else {
        console.log('❌ Sitemap URL is MISSING from robots.txt');
    }
} else {
    console.log('❌ robots.txt is missing');
}

// Pillar 2: Sitemap
console.log('\n[Pillar 2: Sitemap]');
if (fs.existsSync(SITEMAP_PATH)) {
    const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
    
    // Check XML declaration
    if (sitemapContent.trimStart().startsWith('<?xml')) {
        console.log('✅ XML declaration found at start of file');
    } else {
        console.log('❌ XML declaration missing or preceded by whitespace');
    }

    // Basic XML Structure check
    if (sitemapContent.includes('<urlset') && sitemapContent.includes('</urlset>')) {
        console.log('✅ Basic <urlset> structure is valid');
    } else {
        console.log('❌ Invalid <urlset> tags');
    }

    // Check for trailing slashes or authenticated routes
    const urls = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
    console.log(`\nFound ${urls.length} URLs in sitemap:`);
    
    for (const urlTag of urls) {
        const url = urlTag.replace('<loc>', '').replace('</loc>', '');
        let issues = [];
        
        if (url.endsWith('/') && url.split('/').length > 4) {
            issues.push('Trailing slash found (non-root)');
        }
        
        const privateKeywords = ['dashboard', 'settings', 'admin', 'onboarding', 'workspace'];
        if (privateKeywords.some(k => url.includes(k))) {
            issues.push('Private/Authenticated route found');
        }

        if (issues.length > 0) {
            console.log(`  - ${url} ⚠️  ${issues.join(', ')}`);
        } else {
            console.log(`  - ${url} ✅ Clean`);
        }
    }
} else {
    console.log('❌ sitemap.xml is missing');
}

// Pillar 3: index.html check
console.log('\n[Pillar 3: index.html SEO]');
const indexHtmlPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');
    if (html.includes('rel="canonical"')) console.log('✅ Canonical tag found');
    else console.log('❌ Canonical tag missing');

    if (html.includes('rel="sitemap"')) console.log('✅ Sitemap link tag found');
    else console.log('❌ Sitemap link tag missing');
}

console.log('\n--- Validation Complete ---');
