import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ConnectButton, darkTheme, useActiveAccount } from "thirdweb/react";
import { client } from "../client";
import image from "../assets/Logo.png";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const account = useActiveAccount();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`${
        scrolled ? "bg-[#001636] bg-opacity-80 backdrop-blur-sm" : "bg-[#001636] bg-opacity-70"
      } fixed top-0 left-0 w-full z-50 shadow-md transition-all ease-in-out duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <img src={image} alt="Logo" className="h-10 w-10" />
            <Link to="/">
              <h1 className="text-2xl font-bold text-white cursor-pointer">
                <span className="text-white">BCUT </span>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SCORE
                </span>
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {account ? (
              <>
                <Link
                  to="/Token"
                  className={`${
                    isActive("/Token") ? "text-blue-400 font-semibold " : "text-white hover:text-blue-200"
                  } transition font-medium`}
                >
                  Token
                </Link>

                <Link
                  to="/Pool"
                  className={`${
                    isActive("/Pool") ? "text-blue-400 font-semibold " : "text-white hover:text-blue-200"
                  } transition font-medium`}
                >
                  Pool
                </Link>

                <Link
                  to="/Portfolio"
                  className={`${
                    isActive("/Portfolio") ? "text-blue-400 font-semibold " : "text-white hover:text-blue-200"
                  } transition font-medium`}
                >
                  Portfolio
                </Link>

                <Link
                  to="/Subscription"
                  className={`${
                    isActive("/Subscription") ? "text-blue-400 font-semibold " : "text-white hover:text-blue-200"
                  } transition font-medium`}
                >
                  Subscription
                </Link>
              </>
            ) : (
              <></>
            )}
            <ConnectButton
              client={client}
              theme={darkTheme()}
              detailsButton={{
                style: {
                  maxHeight: "50px",
                  backgroundColor: "#111827",
                  color: "white",
                  borderRadius: "8px",
                },
              }}
            />
          </div>

          {/* Mobile Hamburger Icon */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
  <div className="md:hidden bg-[#001636] border-t border-gray-700 p-4">
    <div className="space-y-4">
      {/* Close button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen(false)}
          className="text-white focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Links Section */}
      {account && (
        <div className="space-y" style={{marginLeft:"50px"}}>
          <Link
            to="/Token"
            className={`${
              isActive("/Token") ? "text-blue-400 font-semibold " : "text-white hover:text-blue-200"
            } transition block text-lg`}
            onClick={() => setIsOpen(false)}
          >
            Token
          </Link>

          <Link
            to="/Pool"
            className={`${
              isActive("/Pool") ? "text-blue-400 font-semibold " : "text-white hover:text-blue-200"
            } transition block text-lg `}
            onClick={() => setIsOpen(false)}
          >
            Pool
          </Link>

          <Link
            to="/Portfolio"
            className={`${
              isActive("/Portfolio") ? "text-blue-400 font-semibold " : "text-white hover:text-blue-200"
            } transition block text-lg `}
            onClick={() => setIsOpen(false)}
          >
            Portfolio
          </Link>

          <Link
            to="/Subscription"
            className={`${
              isActive("/Subscription") ? "text-blue-400 font-semibold " : "text-white hover:text-blue-200"
            } transition block text-lg `}
            onClick={() => setIsOpen(false)}
          >
            Subscription
          </Link>
        </div>
      )}

      {/* Connect Button */}
      <div className="mt-4">
        <ConnectButton
          client={client}
          theme={darkTheme()}
          detailsButton={{
            style: {
              marginLeft:"50px",
              maxHeight: "50px",
              backgroundColor: "#111827",
              color: "white",
              borderRadius: "8px",
              width: "25%"
            },
          }}
        />
      </div>
    </div>
  </div>
)}

    </nav>
  );
}

export default Navbar;
