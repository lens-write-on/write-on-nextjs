import { cn } from "@/lib/utils";
import "./HowitWorksBlocks.css"; // Import the CSS file
import { motion } from "framer-motion";

const Blocks = ({ className = "", text = "", children = null }) => {
  // Function to handle text with <br /> tags
  const renderTextWithLineBreaks = (text) => {
    if (!text) return "JOIN";

    // Split the text at <br /> tags
    const parts = text.split("<br />");

    // Return the parts with line breaks between them
    return parts.map((part, index) => (
      <span key={index} className="block">
        {part}
        {index < parts.length - 1 && <br />}
      </span>
    ));
  };

  return (
    <motion.div
      whileHover={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        `howitworks rounded-2xl border-[5px] flex flex-col justify-center items-center
        overflow-hidden relative
        backdrop-blur-md shadow-2xl`,
        className
      )}
    >
      <div className="absolute z-0 inset-0 bg-gradient-to-br from-black/20 to-black/40 opacity-80"></div>
      
      <div className="glow"></div>
      <div className="shimmer"></div>
      
      <motion.h4 
        initial={{ opacity: 0.8 }}
        whileHover={{ scale: 1.05, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="title font-extrabold text-center text-4xl z-10 relative py-4 px-6 tracking-wider"
      >
        {renderTextWithLineBreaks(text)}
      </motion.h4>
      
      <div className="childrenContainer z-0">{children && children}</div>
      
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/40 to-transparent"></div>
      <div className="border-element"></div>
    </motion.div>
  );
};

export default Blocks;
