// lib/mega.js
// Central CDN configuration for external resources
// Use with Next.js Script component (next/script)

export const cdn = {
  // Core libraries
  react: 'https://unpkg.com/react@18/umd/react.production.min.js',
  reactDom: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',

  // Utility libraries
  axios: 'https://cdn.jsdelivr.net/npm/axios@1/dist/axios.min.js',
  lodash: 'https://cdn.jsdelivr.net/npm/lodash@4/lodash.min.js',
  moment: 'https://cdn.jsdelivr.net/npm/moment@2/moment.min.js',

  // Styles (rarely needed with Tailwind, but included for completeness)
  tailwind: 'https://cdn.jsdelivr.net/npm/tailwindcss@3/dist/tailwind.min.css',
  fontAwesome: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',

  // Common fonts
  googleFonts: {
    inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    roboto: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  },

  // Analytics / third-party (examples)
  googleAnalytics: (id) => `https://www.googletagmanager.com/gtag/js?id=${id}`,
  googleTagManager: (id) => `https://www.googletagmanager.com/gtm.js?id=${id}`,
};

// Helper function to load scripts with Next.js Script component
// Use like: <Script {...scriptProps('react')} />
export const scriptProps = (key, options = {}) => {
  const url = typeof cdn[key] === 'function' ? cdn[key](options.id) : cdn[key];
  return {
    src: url,
    strategy: options.strategy || 'lazyOnload', // 'beforeInteractive' | 'afterInteractive' | 'lazyOnload'
    ...options,
  };
};

// For stylesheets (use with next/head or _document.js)
export const stylesheetLinks = {
  tailwind: { rel: 'stylesheet', href: cdn.tailwind },
  fontAwesome: { rel: 'stylesheet', href: cdn.fontAwesome },
  inter: { rel: 'stylesheet', href: cdn.googleFonts.inter },
};