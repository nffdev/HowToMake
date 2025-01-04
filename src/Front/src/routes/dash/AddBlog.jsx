import React, { useState } from 'react';
import { useAuth } from "@/lib/hooks/useAuth";
import { motion } from 'framer-motion';
import { FiSend, FiX } from 'react-icons/fi';

export default function AddBlog() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const manageSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setTitle('');
    setContent('');
    setIsSubmitting(false);
    alert('Blog post submitted successfully!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-[#00FF00] p-8 flex flex-col items-center justify-center"
    >
      <motion.h1 
        className="text-4xl mb-8 font-bold"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        Add New Blog Post
      </motion.h1>
      <motion.form 
        onSubmit={manageSubmit}
        className="w-full max-w-2xl space-y-6"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div>
          <label htmlFor="title" className="block mb-2 text-lg">Title:</label>
          <motion.input 
            whileFocus={{ scale: 1.02 }}
            type="text" 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required
            className="w-full p-2 bg-black border-2 border-[#00FF00] focus:outline-none focus:border-[#00FF00] text-[#FFF]"
          />
        </div>
        <div>
          <label htmlFor="content" className="block mb-2 text-lg">Content:</label>
          <motion.textarea 
            whileFocus={{ scale: 1.02 }}
            id="content" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required
            className="w-full h-64 p-2 bg-black border-2 border-[#00FF00] focus:outline-none focus:border-[#00FF00] text-[#FFF] resize-none"
          />
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit" 
          disabled={isSubmitting}
          className="w-full p-2 bg-[#00FF00] text-black font-bold text-lg transition-colors duration-300 hover:bg-[#00CC00] flex items-center justify-center"
        >
          {isSubmitting ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <FiSend className="mr-2" />
            </motion.div>
          ) : (
            <>
              <FiSend className="mr-2" />
              Submit
            </>
          )}
        </motion.button>
      </motion.form>
      <motion.div 
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-[#00FF00]/60">
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </p>
      </motion.div>
    </motion.div>
  );
}