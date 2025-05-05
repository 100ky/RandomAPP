module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['your-image-domain.com'], // Replace with your image domain if needed
  },
  env: {
    MAPLIBRE_ACCESS_TOKEN: process.env.MAPLIBRE_ACCESS_TOKEN, // Example for environment variable
  },
};