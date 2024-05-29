/** @type {import('next').NextConfig} */
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default {
    reactStrictMode: true,
    env: {
        TICKET_ADDRESS: process.env.TICKET_ADDRESS,
        BOTTLE_ADDRESS: process.env.BOTTLE_ADDRESS,
    },
    images: {
        loader: 'custom',
        domains: [],
    },
};

// const nextConfig = {
//     reactStrictMode: true,
//     images: {
//         loader: 'custom',
//         domains: [],
//     },
// };
// export default nextConfig;
