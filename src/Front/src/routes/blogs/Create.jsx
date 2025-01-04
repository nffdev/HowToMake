import React, { useState } from 'react';
import Header from "@/components/nav/Header";
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';
import { BASE_API } from "../../config.json";

export default function AddBlog() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const manageSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!title || !content) {
      setError("Title and content are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_API}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const result = await response.json();

      if (response.ok) {
        setTitle('');
        setContent('');
        alert('Blog post submitted successfully!');
      } else {
        setError(result.message || 'An error occurred.');
      }
    } catch {
      setError('An error occurred while submitting the blog.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-[#00FF00] p-8"
    >
      <Header />
      <motion.div
        className="flex flex-col items-center justify-center"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120 }}
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
          {error && <p className="text-red-500 text-center">{error}</p>}
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
            {isSubmitting ? 'Submitting...' : (
              <>
                <FiSend className="mr-2" />
                Submit
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.main>
  );
}
