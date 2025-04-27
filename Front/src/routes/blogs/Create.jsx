import React, { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import Header from "@/components/nav/Header";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Image as ImageIcon, Upload, X, Plus, Trash2, MoveVertical, ArrowUp, ArrowDown, Type } from 'lucide-react';
import { BASE_API } from "../../config.json";

export default function AddBlog() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [blocks, setBlocks] = useState([{ type: 'text', content: '', position: 0, id: Date.now() }]);
  const [activeBlockId, setActiveBlockId] = useState(null);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [currentUploadBlockId, setCurrentUploadBlockId] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const combinedContent = blocks
      .filter(block => block.type === 'text')
      .sort((a, b) => a.position - b.position)
      .map(block => block.content)
      .join('\n\n');
    setContent(combinedContent);
    
    const firstImage = blocks.find(block => block.type === 'image');
    if (firstImage) {
      setImageUrl(firstImage.content);
    } else {
      setImageUrl('');
    }
  }, [blocks]);

  const addBlock = (type, position) => {
    const newBlock = {
      type,
      content: '',
      position: position !== undefined ? position : blocks.length,
      id: Date.now()
    };
    setBlocks([...blocks, newBlock]);
    setActiveBlockId(newBlock.id);
    
    if (type === 'image') {
      setCurrentUploadBlockId(newBlock.id);
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  };

  const updateBlockContent = (id, newContent) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content: newContent } : block
    ));
  };

  const removeBlock = (id) => {
    if (blocks.length <= 1) {
      setError("Vous devez conserver au moins un bloc de contenu.");
      return;
    }
    
    setBlocks(blocks.filter(block => block.id !== id));
    if (activeBlockId === id) {
      setActiveBlockId(null);
    }
  };

  const moveBlock = (id, direction) => {
    const blockIndex = blocks.findIndex(block => block.id === id);
    if (blockIndex === -1) return;
    
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    
    const currentPosition = newBlocks[blockIndex].position;
    newBlocks[blockIndex].position = newBlocks[targetIndex].position;
    newBlocks[targetIndex].position = currentPosition;
    
    newBlocks.sort((a, b) => a.position - b.position);
    
    setBlocks(newBlocks);
  };

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
        
        if (currentUploadBlockId) {
          setBlocks(blocks.map(block => 
            block.id === currentUploadBlockId 
              ? { ...block, content: data.imageUrl } 
              : block
          ));
          setCurrentUploadBlockId(null);
        } else {
          setImageUrl(data.imageUrl);
        }
        
        setImagePreview(data.imageUrl);
        setUploadProgress(100);
        setTimeout(() => setIsUploading(false), 500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload image');
        setIsUploading(false);
        
        if (currentUploadBlockId) {
          removeBlock(currentUploadBlockId);
          setCurrentUploadBlockId(null);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error uploading image. Please try again.');
      setIsUploading(false);
      
      if (currentUploadBlockId) {
        removeBlock(currentUploadBlockId);
        setCurrentUploadBlockId(null);
      }
    }
  };
  
  const handleRemoveImage = (id) => {
    if (id) {
      removeBlock(id);
    } else {
      setImageUrl('');
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const manageSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!title) {
      setError("Title is required.");
      setIsSubmitting(false);
      return;
    }

    const hasContent = blocks.some(block => block.content.trim() !== '');
    if (!hasContent) {
      setError("At least one block must have content.");
      setIsSubmitting(false);
      return;
    }

    try {
      const sortedBlocks = [...blocks]
        .sort((a, b) => a.position - b.position)
        .map(({ id, ...rest }) => rest); 

      const response = await fetch(`${BASE_API}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          title, 
          content, 
          imageUrl, 
          blocks: sortedBlocks 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        try {
          const blogsResponse = await fetch(`${BASE_API}/blogs`, {
            headers: { Authorization: `${localStorage.getItem("token")}` },
          });
          const ownerBlogsResponse = await fetch(`${BASE_API}/blogs/owner`, {
            headers: { Authorization: `${localStorage.getItem("token")}` },
          });
          
          if (blogsResponse.ok && ownerBlogsResponse.ok) {
            const blogsData = await blogsResponse.json();
            const ownerBlogsData = await ownerBlogsResponse.json();
            
            mutate('/blogs', blogsData, false);
            mutate('/blogs/owner', ownerBlogsData, false);
            
            sessionStorage.setItem('newBlogCreated', 'true');
            sessionStorage.setItem('lastBlogCreated', Date.now().toString());
            
            navigate(`/blogs/${result.id}`);
          } else {
            sessionStorage.setItem('newBlogCreated', 'true');
            navigate(`/blogs/${result.id}`);
          }
        } catch (error) {
          console.error('Error updating blog lists:', error);
          sessionStorage.setItem('newBlogCreated', 'true');
          navigate(`/blogs/${result.id}`);
        }
      } else {
        setError(result.message || 'Failed to create blog');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      setError('Error creating blog. Please try again.');
      setIsSubmitting(false);
    }
  };

  const renderBlock = (block, index) => {
    const isActive = activeBlockId === block.id;
    
    return (
      <motion.div 
        key={block.id}
        className={`mb-4 border-2 ${isActive ? 'border-[#00FF00]' : 'border-[#00FF00]/30'} p-3 relative`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="mr-2 text-sm">
              {block.type === 'text' ? 'Texte' : 'Image'}
            </span>
            <span className="text-xs text-[#00FF00]/60">Position: {block.position}</span>
          </div>
          <div className="flex space-x-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => moveBlock(block.id, 'up')}
              disabled={index === 0}
              className={`text-[#00FF00] ${index === 0 ? 'opacity-30' : 'hover:text-[#00FF00]/80'}`}
            >
              <ArrowUp size={16} />
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => moveBlock(block.id, 'down')}
              disabled={index === blocks.length - 1}
              className={`text-[#00FF00] ${index === blocks.length - 1 ? 'opacity-30' : 'hover:text-[#00FF00]/80'}`}
            >
              <ArrowDown size={16} />
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => removeBlock(block.id)}
              className="text-red-500 hover:text-red-400"
            >
              <Trash2 size={16} />
            </motion.button>
          </div>
        </div>
        
        {block.type === 'text' ? (
          <motion.textarea
            value={block.content}
            onChange={(e) => updateBlockContent(block.id, e.target.value)}
            onFocus={() => setActiveBlockId(block.id)}
            className="w-full h-32 p-2 bg-black border border-[#00FF00]/50 focus:outline-none focus:border-[#00FF00] text-[#FFF] resize-none"
            placeholder="Enter your text here..."
            whileFocus={{ scale: 1.01 }}
          />
        ) : (
          <div className="flex flex-col items-center">
            {block.content ? (
              <div className="relative w-full">
                <img 
                  src={block.content} 
                  alt="Block content" 
                  className="max-h-64 max-w-full object-contain mx-auto"
                  onError={(e) => {
                    console.error('Image error:', block.content);
                    setError(`Could not load image at position ${block.position}`);
                    e.target.style.display = 'none';
                  }}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveImage(block.id)}
                  className="absolute top-2 right-2 bg-black/70 rounded-full p-1 text-red-500 hover:text-red-400"
                >
                  <X size={16} />
                </motion.button>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCurrentUploadBlockId(block.id);
                    fileInputRef.current.click();
                  }}
                  className="w-full p-2 border-2 border-dashed border-[#00FF00]/50 bg-black hover:bg-[#00FF00]/10 transition-colors flex items-center justify-center"
                >
                  <Upload size={20} className="mr-2" />
                  Upload Image
                </motion.button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
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
        className="flex flex-col items-center justify-center flex-grow w-full max-w-4xl mx-auto"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <motion.h1
          className="text-4xl mb-8 font-bold text-center"
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 120 }}
        >
          Create New Blog Post
        </motion.h1>
        <motion.form
          onSubmit={manageSubmit}
          className="w-full space-y-6"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          {error && (
            <motion.div 
              className="bg-red-900/30 border border-red-500 p-3 rounded"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-red-400 text-center">{error}</p>
            </motion.div>
          )}
          
          <div>
            <label htmlFor="title" className="block mb-2 text-lg">Title:</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-3 bg-black border-2 border-[#00FF00] focus:outline-none focus:border-[#00FF00] text-[#FFF] text-lg"
              placeholder="Enter a title..."
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-lg">Content Blocks:</label>
              <div className="flex space-x-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addBlock('text')}
                  className="flex items-center px-3 py-1 bg-[#00FF00]/20 hover:bg-[#00FF00]/30 border border-[#00FF00]/50 text-[#00FF00]"
                >
                  <Type size={16} className="mr-1" />
                  Add Text
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addBlock('image')}
                  className="flex items-center px-3 py-1 bg-[#00FF00]/20 hover:bg-[#00FF00]/30 border border-[#00FF00]/50 text-[#00FF00]"
                >
                  <ImageIcon size={16} className="mr-1" />
                  Add Image
                </motion.button>
              </div>
            </div>
            
            <div className="space-y-2">
              {blocks.sort((a, b) => a.position - b.position).map(renderBlock)}
            </div>
          </div>
          
          <input 
            type="file" 
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden" 
            onChange={(e) => handleImageUpload(e.target.files[0])}
            ref={fileInputRef}
          />
          
          {isUploading && (
            <motion.div 
              className="w-full bg-[#003300] h-2 rounded-full overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div 
                className="bg-[#00FF00] h-full transition-all duration-300 ease-out" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </motion.div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full p-3 bg-[#00FF00] text-black font-bold text-lg transition-colors duration-300 hover:bg-[#00CC00] flex items-center justify-center mt-8"
          >
            {isSubmitting ? 'Publishing...' : (
              <>
                <Send className="mr-2" />
                Publish Blog Post
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.main>
  );
}
