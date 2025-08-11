import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa'; // Import React Icons

function Footer() {
  return (
    <div className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Brand Section (Logo on Left) */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-left">
        <h1 className='text-2xl font-bold ml-2 text-left'>BCUT</h1>
            <h1 className="text-2xl font-bold ml-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">SCORE</h1>
          </div>
        </div>

        {/* Social Links Section */}
        <div className="flex justify-center gap-8 mb-6">
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white p-3 bg-[#111827] hover:bg-blue-500 rounded-full transition-all"
            title="Facebook"
          >
            <FaFacebookF size={24} />
          </a>
          <a
            href="https://www.twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white p-3 bg-[#111827] hover:bg-blue-300 rounded-full transition-all"
            title="Twitter"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white p-3 bg-[#111827] hover:bg-pink-500 rounded-full transition-all"
            title="Instagram"
          >
            <FaInstagram size={24} />
          </a>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white p-3 bg-[#111827] hover:bg-blue-600 rounded-full transition-all"
            title="LinkedIn"
          >
            <FaLinkedinIn size={24} />
          </a>
        </div>

        {/* Copyright Section (Bottom of the Footer) */}
        <div className="text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} BCUT Score. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Footer;


