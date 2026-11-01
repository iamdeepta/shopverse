/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export for GitHub Pages (project site at /shopverse).
  output: 'export',
  basePath: '/shopverse',
  // Every route is emitted as <route>/index.html, which is what a plain
  // static file server (GitHub Pages) serves for directory URLs. Without
  // trailing slashes, /shop/aurelle/products/ would 404 on Pages.
  trailingSlash: true,
  images: {
    // The Pages static host has no image optimizer; serve files as-is.
    // NOTE: unoptimized next/image renders src verbatim (no basePath
    // prefix), so all image paths in src/ carry the '/shopverse' prefix
    // explicitly. Keep them in sync if basePath ever changes.
    unoptimized: true,
  },
};

export default nextConfig;
