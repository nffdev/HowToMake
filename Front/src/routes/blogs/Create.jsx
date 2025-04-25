import React, { useState, useRef } from 'react';
import useSWR from 'swr';
import Header from "@/components/nav/Header";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Image as ImageIcon, Upload, X } from 'lucide-react';
import { BASE_API } from "../../config.json";

export default function AddBlog() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const fetcher = (url) =>
    fetch(`${BASE_API}${url}`, {
      headers: { Authorization: `${localStorage.getItem("token")}` },
    }).then((response) => response.json());

  const { data: user } = useSWR('/user/me', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPEG, PNG, GIF and WEBP images are allowed');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    const formData = new FormData();
    formData.append('image', file);
    
    setIsUploading(true);
    setUploadProgress(0);
    setError('');
    
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);
      
      const response = await fetch(`${BASE_API}/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: `${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.imageUrl);
        setImagePreview(data.imageUrl);
        setUploadProgress(100);
        setTimeout(() => setIsUploading(false), 500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload image');
        setIsUploading(false);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error uploading image. Please try again.');
      setIsUploading(false);
    }
  };
  
  const handleRemoveImage = () => {
    setImageUrl('');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
          Authorization: `${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title, content, imageUrl }),
      });

      const result = await response.json();

      if (response.ok) {
        setTitle('');
        setContent('');
        setImageUrl('');
        setImagePreview(null);
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
      className="min-h-screen bg-black text-[#00FF00] p-8 flex flex-col"
    >
      <Header user={user} />
      <motion.div className="flex flex-col items-start">
        <motion.button
          onClick={() => navigate("/blogs")}
          className="mb-4 flex items-center text-[#00FF00] hover:text-[#00FF00]/80 transition-colors"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </motion.button>
      </motion.div>
      <motion.div
        className="flex flex-col items-center justify-center flex-grow"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <motion.h1
          className="text-4xl mb-8 font-bold text-center"
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
          <div>
            <label htmlFor="image" className="block mb-2 text-lg">Image (optional):</label>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="url"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (!e.target.value) {
                      setImagePreview(null);
                    }
                  }}
                  placeholder="https://placehold.co/600x400"
                  className="flex-1 p-2 bg-black border-2 border-[#00FF00] focus:outline-none focus:border-[#00FF00] text-[#FFF]"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (imageUrl) {
                      setImagePreview(imageUrl);
                    }
                  }}
                  className="p-2 bg-[#00FF00] text-black font-bold transition-colors duration-300 hover:bg-[#00CC00] flex items-center justify-center"
                >
                  <ImageIcon size={20} />
                </motion.button>
              </div>
              
              <div className="text-center">
                <p className="text-sm mb-2">- OR -</p>
              </div>
              
              <div className="flex flex-col items-center">
                <input 
                  type="file" 
                  id="image" 
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden" 
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  ref={fileInputRef}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current.click()}
                  className="w-full p-2 border-2 border-dashed border-[#00FF00] bg-black hover:bg-[#00FF00]/10 transition-colors flex items-center justify-center"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center w-full">
                      <p className="mb-2">Uploading... {Math.round(uploadProgress)}%</p>
                      <div className="w-full bg-[#003300] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#00FF00] h-full transition-all duration-300 ease-out" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="mr-2" />
                      Upload Image
                    </>
                  )}
                </motion.button>
              </div>
              
              {imagePreview && (
                <div className="mt-4 border-2 border-[#00FF00] p-2 relative">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm">Image Preview:</p>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleRemoveImage}
                      className="text-red-500 hover:text-red-400"
                    >
                      <X size={18} />
                    </motion.button>
                  </div>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-40 max-w-full object-contain mx-auto"
                    onError={(e) => {
                      console.error('Image preview error:', imagePreview);
                      setError("Could not load image. Please try again.");
                      setImagePreview(null);
                      setImageUrl('');
                    }}
                  />
                </div>
              )}
            </div>
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
                <Send className="mr-2" />
                Submit
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.main>
  );
}
