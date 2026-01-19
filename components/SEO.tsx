
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  keywords?: string[];
  canonical?: string;
  noindex?: boolean;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  keywords = [],
  canonical,
  noindex = false
}) => {
  const siteTitle = 'Soho Space | The Growth Atelier';
  const siteDescription = 'Unlock your growth potential. Connect with elite growth partners and visionary founders to build, launch, and scale category-defining products.';
  const siteUrl = 'https://sohospace.entrext.in';
  
  // Dynamic values
  const pageTitle = title ? `${title} | Soho Space` : siteTitle;
  const pageDescription = description || siteDescription;
  const pageImage = image || 'https://sohospace.entrext.in/og-image.jpg'; // We'll need to ensure this asset exists or use a placeholder
  const pageUrl = url ? `${siteUrl}${url}` : siteUrl;
  const pageCanonical = canonical || pageUrl;

  const defaultKeywords = [
    'Shared Growth Workspace',
    'Outcome-based Growth Partnership',
    'Fractional Growth Operations',
    'Equity-based Marketing Collaboration',
    'Startup Co-founder Matching',
    'Commission-based Growth Platform',
    'Growth Atelier for Founders',
    'Vetted Fractional CMOs',
    'SaaS Growth Architects'
  ];

  const allKeywords = [...defaultKeywords, ...keywords].join(', ');

  // Organization Schema (AEO Layer)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Soho Space",
    "alternateName": "The Growth Atelier",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "description": "A shared growth workspace where founders and growth partners collaborate transparently on equity and commission-based terms.",
    "sameAs": [
      "https://www.linkedin.com/company/entrext/posts/?feedView=all",
      "https://www.instagram.com/entrext.labs/",
      "https://substack.com/@entrextlabs",
      "https://twitter.com/EntrextLabs", 
      "https://github.com/entrext" 
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "business@entrext.in"
    }
  };

  // FAQ Schema for AEO - Aligned with UI
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Soho Space?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Soho Space is a shared growth workspace (The Growth Atelier) that connects visionary startup founders with elite growth partners. Unlike traditional marketplaces, it focuses on outcome-based collaborations including equity, revenue share, and performance-linked compensation."
        }
      },
      {
        "@type": "Question",
        "name": "Who is Soho Space for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It is designed for early-to-growth stage startup founders, fractional CMOs, growth engineers, and product marketers who prefer high-trust, aligned partnerships over transactional freelance work."
        }
      },
      {
        "@type": "Question",
        "name": "How is Soho Space different from a freelance marketplace or agency?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Soho Space is an operating system for growth, not a gig board. We replace hourly billing with aligned incentives (Equity/Commission) and provide execution frameworks (NDAs, Decision Logs) to manage the partnership transparently."
        }
      },
      {
        "@type": "Question",
        "name": "How do Growth Partners get paid?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Compensation is outcome-led. Engagements are typically structured as Equity Participation (vesting), Revenue Share (commission-based), or Performance Retainers, formalized via our platform's smart agreements."
        }
      },
      {
        "@type": "Question",
        "name": "What serves as proof of quality on Soho Space?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We strictly vet talent using our 'Reputation Dynamics' engine, which verifies past performance, portfolio impact, and qualitative feedback, ensuring a high-density network of elite professionals."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a free version of Soho Space?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The 'The Growth Free' plan allows for professional profile creation and public discovery. The 'Founder/Partner Pro' plan unlocks AI vetting, advanced matching, and verified badges."
        }
      }
    ]
  };

  return (
    <Helmet>
      {/* Global Metadata */}
      <html lang="en" />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={allKeywords} />
      <link rel="canonical" href={pageCanonical} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content="Soho Space" />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* Structured Data (JSON-LD) */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      
      {/* Inject FAQ Schema only on relevant pages (Logic handled by parent or here if simple) */}
      {/* For now, we allow it globally or strictly on 'website' type pages for generic FAQs */}
      {type === 'website' && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </Helmet>
  );
};

export default SEO;
