import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import Header from "@/components/nav/Header";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BASE_API, OWNER_ID, POSTS_PER_PAGE } from "../../config.json";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const articleVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const gridItemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

export default function Blogs() {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const fetcher = (url) =>
    fetch(`${BASE_API}${url}`, {
      headers: { Authorization: `${localStorage.getItem("token")}` },
    }).then((response) => response.json());

  const { data: user } = useSWR("/user/me", fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const { data: posts, isLoading, mutate: mutatePosts } = useSWR("/blogs", fetcher, {
    revalidateIfStale: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 2000,
  });

  const manageDelete = async (postId) => { 
    try {
      if (posts) {
        const updatedPosts = posts.filter(post => post.id !== postId);
        
        mutatePosts(updatedPosts, false);
      }
      
      const response = await fetch(`${BASE_API}/blogs/${postId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `${localStorage.getItem("token")}`,
        },
      });
      
      if (response.ok) {
        mutatePosts(undefined, { revalidate: true });
        mutate('/blogs/owner', undefined, { revalidate: true });
        
        setTimeout(() => {
          alert("Blog deleted successfully.");
        }, 100);
      } else {
        mutatePosts(undefined, { revalidate: true });
        alert("Failed to delete blog."); 
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      mutatePosts(undefined, { revalidate: true });
      alert("An error occurred while deleting the blog.");
    }
  };

  const totalPages = Math.ceil((posts?.length || 0) / POSTS_PER_PAGE);
  
  useEffect(() => {
    if (posts && currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [posts, currentPage, totalPages]);

  useEffect(() => {
    const checkAndUpdateBlogs = () => {
      const newBlogCreated = sessionStorage.getItem('newBlogCreated');
      
      if (newBlogCreated === 'true') {
        console.log('New blog created, refreshing blogs list');
        mutatePosts(undefined, { revalidate: true });
        
        sessionStorage.removeItem('newBlogCreated');
      }
    };
    
    checkAndUpdateBlogs();
    
    const handleBlogCreated = (event) => {
      mutatePosts(undefined, { revalidate: true });
    };
    
    const handleStorageChange = (e) => {
      if (e.key === 'newBlogCreated') {
        checkAndUpdateBlogs();
      }
    };
    
    window.addEventListener('blogCreated', handleBlogCreated);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('blogCreated', handleBlogCreated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [mutatePosts]);

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts ? posts.slice(startIndex, endIndex) : [];

  return (
    <div className="mx-auto px-4 min-h-screen bg-black text-[#00FF00] overflow-x-hidden">
      <motion.main
        className="py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Header user={user} />
        <motion.div
          className="border-b border-[#00FF00]/20 mb-8"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />

        {currentPosts && currentPosts.length > 0 ? (
          currentPosts.map((post, index) => (
            <motion.article
              key={index}
              className="relative mb-16 px-4"
              variants={articleVariants}
            >
              <div className="grid grid-cols-[auto,1fr] gap-4">
                <div className="grid grid-cols-3 gap-2 text-[#00FF00]/20">
                  {post.blocks && post.blocks.some(block => block.type === 'image') ? (
                    <motion.div 
                      className="col-span-3 row-span-3 w-24 h-24 overflow-hidden border-2 border-[#00FF00]/30"
                      variants={gridItemVariants}
                      whileHover={{ scale: 1.05 }}
                    >
                      <img 
                        src={post.blocks.find(block => block.type === 'image').content.startsWith('http') 
                          ? post.blocks.find(block => block.type === 'image').content 
                          : `${BASE_API}${post.blocks.find(block => block.type === 'image').content}`} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.parentNode.innerHTML = 
                            '<div className="flex items-center justify-center w-full h-full bg-[#00FF00]/10">' +
                            [...Array(9)].map(() => '+').join(' ') +
                            '</div>';
                        }}
                      />
                    </motion.div>
                  ) : post.imageUrl ? (
                    <motion.div 
                      className="col-span-3 row-span-3 w-24 h-24 overflow-hidden border-2 border-[#00FF00]/30"
                      variants={gridItemVariants}
                      whileHover={{ scale: 1.05 }}
                    >
                      <img 
                        src={post.imageUrl.startsWith('http') ? post.imageUrl : `${BASE_API}${post.imageUrl}`} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.parentNode.innerHTML = 
                            '<div className="flex items-center justify-center w-full h-full bg-[#00FF00]/10">' +
                            [...Array(9)].map(() => '+').join(' ') +
                            '</div>';
                        }}
                      />
                    </motion.div>
                  ) : (
                    [...Array(9)].map((_, i) => (
                      <motion.span 
                        key={i} 
                        className="flex items-center justify-center w-8 h-8"
                        variants={gridItemVariants}
                      >
                        +
                      </motion.span>
                    ))
                  )}
                </div>

                <div>
                  <motion.h2
                    onClick={() => navigate(`/blogs/${post.id}`)}
                    className="text-xl mb-1 cursor-pointer"
                    whileHover={{ scale: 1.05, originX: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {post.title}
                  </motion.h2>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <motion.time
                        className="text-[#00FF00]/60 text-sm mr-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {post.createdAt}
                      </motion.time>
                      <motion.span
                        className="text-[#00FF00]/80 text-sm flex items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                      >
                        <span className="inline-block w-2 h-2 bg-[#00FF00]/40 rounded-full mr-2"></span>
                        By {post.author.username}
                      </motion.span>
                    </div>
                    <motion.div 
                      className="flex items-center text-[#00FF00]/60 text-xs"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Clock size={12} className="mr-1" />
                      <span>5 min read</span>
                    </motion.div>
                  </div>
                  <div className="space-y-4">
                    {post.blocks && post.blocks.length > 0 ? (
                      <motion.div 
                        className="w-full"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.p
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          className="leading-relaxed w-full auto-format-text"
                        >
                          {(() => {
                            const textBlock = post.blocks
                              .sort((a, b) => a.position - b.position)
                              .find(block => block.type === 'text');
                            
                            if (textBlock) {
                              return textBlock.content.length > 150 
                                ? textBlock.content.substring(0, 150).trim() + '...'
                                : textBlock.content;
                            }
                            return "";
                          })()} 
                        </motion.p>
                      </motion.div>
                    ) : (
                      <motion.p
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        className="leading-relaxed w-full auto-format-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {post.content && post.content.length > 150 
                          ? post.content.substring(0, 150).trim() + '...' 
                          : post.content}
                      </motion.p>
                    )}
                  </div>
                  {user && (user.id === post.author.id || user.id === OWNER_ID) && (
                    <button
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => manageDelete(post.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {index !== currentPosts.length - 1 && (
                <motion.div
                  className="border-b border-[#00FF00]/20 mt-16"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                />
              )}
            </motion.article>
          ))
        ) : (
          <motion.div 
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="text-[#00FF00]/80 mb-4 flex justify-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <FileText size={64} className="text-[#00FF00]/80" />
            </motion.div>
            <motion.h2 
              className="text-2xl font-bold mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              No Blogs Found
            </motion.h2>
            <motion.p
              className="text-[#00FF00]/60 max-w-md mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              There are no blog posts to display at the moment. Be the first to create one!
            </motion.p>
            {user && (
              <motion.button
                onClick={() => navigate("/blogs/create")}
                className="px-4 py-2 bg-[#00FF00]/20 hover:bg-[#00FF00]/30 border border-[#00FF00]/50 text-[#00FF00] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Create a Blog Post
              </motion.button>
            )}
          </motion.div>
        )}

        {currentPosts && currentPosts.length > 0 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                    mutatePosts(undefined, { revalidate: true });
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                      mutatePosts(undefined, { revalidate: true });
                    }}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    mutatePosts(undefined, { revalidate: true });
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </motion.main>
    </div>
  );
}