// @ts-check
require('dotenv').config()
/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  reactStrictMode: true,
  swcMinify: true,

  env: {
    LIBRARY_ADDRESS: process.env.LIBRARY_ADDRESS,
  },
};
