import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import Link from 'next/link';

/**
 * Modern, reusable header component with blur background effect
 * @param {Object} props - Component props
 * @param {string} props.logo - Logo image source
 * @param {string} props.logoAlt - Logo alt text
 * @param {Array} props.menuItems - Array of menu items with label and href
 * @param {Array} props.rightItems - Array of right-side items (components)
 * @param {boolean} props.glassMorphism - Enable glass morphism effect
 * @param {string} props.className - Additional classes for the header
 */
export const Header = ({
  logo = "/assets/reactbits-logo-CJ9BJbLk.svg",
  logoAlt = "Logo",
  logoHref = "/",
  LogoComponent = null,
  menuItems = [],
  rightItems = [],
  glassMorphism = true,
  className = "",
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0, filter: "blur(4px)" },
    visible: { 
      opacity: 1, 
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerMenuItems = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const menuItemVariant = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0, overflow: 'hidden' },
    open: { 
      opacity: 1, 
      height: 'auto',
      transition: { duration: 0.3 }
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300 ${
        glassMorphism ? 'backdrop-blur-sm' : ''
      } ${
        isScrolled 
          ? 'bg-black/10 shadow-md' 
          : glassMorphism ? 'bg-black/10' : 'bg-black'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          {!LogoComponent && (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInVariants}
              className="flex-shrink-0"
            >
              <Link href={logoHref} className="flex items-center">
                <img 
                  src={logo} 
                  alt={logoAlt} 
                  className="h-8 md:h-10 w-auto" 
                />
              </Link>
            </motion.div>
          )}

          {LogoComponent && (<>{LogoComponent}</>)}

          {/* Desktop Navigation */}
          <motion.nav
            className="hidden md:flex space-x-6 items-center"
            initial="hidden"
            animate="visible"
            variants={staggerMenuItems}
          >
            {menuItems.map((item, index) => (
              <motion.div key={index} variants={menuItemVariant}>
                <Link 
                  href={item.href} 
                  className="text-gray-300 font-semibold hover:opacity-90 transition-colors px-2 py-1"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>

          {/* Right Side Items */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerMenuItems}
            className="hidden md:flex items-center space-x-4"
          >
            {rightItems.map((item, index) => (
              <motion.div key={index} variants={menuItemVariant}>
                {item}
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        className="md:hidden bg-gray-900/95 backdrop-blur-sm"
        initial="closed"
        animate={isMobileMenuOpen ? "open" : "closed"}
        variants={mobileMenuVariants}
      >
        <div className="px-4 pt-2 pb-4 space-y-3">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Mobile menu right items */}
          <div className="pt-4 border-t border-gray-700/50 space-y-4">
            {rightItems.length === 0 ? (
              <>
                <div className="flex justify-between items-center px-3 py-2">
                  <span className="text-gray-300 text-sm">Search Docs</span>
                  <kbd className="bg-gray-800 text-gray-300 px-2 py-1 text-xs rounded">CTRL K</kbd>
                </div>

                <select className="w-full bg-gray-800/60 text-gray-300 text-sm rounded-md border-none px-3 py-2 appearance-none">
                  <option value="JS">JavaScript</option>
                  <option value="TS">TypeScript</option>
                </select>

                <a 
                  href="https://github.com/DavidHDev/react-bits" 
                  target="_blank"
                  rel="noreferrer" 
                  className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md px-3 py-2 w-full"
                >
                  <span className="text-sm font-medium">Star on GitHub</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.2-1.8-1.2-1.8-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.3.9.1-.7.4-1.2.7-1.5-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17 .7 18 1 18 1c.7 1.7.2 3 .1 3.3.7.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 0z"/>
                  </svg>
                </a>
              </>
            ) : (
              <div className="space-y-4">
                {rightItems.map((item, index) => (
                  <div key={index} className="px-3 py-2">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </header>
  );
};

export default Header;
