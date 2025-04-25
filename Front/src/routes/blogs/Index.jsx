import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import Header from "@/components/nav/Header";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BASE_API, OWNER_ID } from "../../config.json";

const POSTS_PER_PAGE = 2;

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

  const { data: posts, isLoading } = useSWR("/blogs", fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const manageDelete = async (postId) => { 
    try {
      const response = await fetch(`${BASE_API}/blogs/${postId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        alert("Blog deleted successfully.");
        window.location.reload(); 
      } else {
        alert("Failed to delete blog."); 
      }
    } catch (error) {
      console.error("Error deleting blog:", error); 
    }
  };

  const totalPages = Math.ceil((posts?.length || 0) / POSTS_PER_PAGE);
  
  useEffect(() => {
    if (posts && currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [posts, currentPage, totalPages]);

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

        {currentPosts.map((post, index) => (
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
                <div className="flex items-center mb-4">
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
                <div className="space-y-4">
                  {post.blocks && post.blocks.length > 0 ? (
                    post.blocks
                      .sort((a, b) => a.position - b.position)
                      .slice(0, 3)
                      .map((block, blockIndex) => (
                        <motion.div 
                          key={`${post.id}-block-${blockIndex}`}
                          className="w-full"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + (blockIndex * 0.05) }}
                        >
                          {block.type === 'text' ? (
                            <motion.p
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              className="leading-relaxed w-full"
                            >
                              {block.content}
                            </motion.p>
                          ) : block.type === 'image' && (
                            <div className="w-full max-w-[200px] mx-auto my-2">
                              <img 
                                src={block.content.startsWith('http') ? block.content : `${BASE_API}${block.content}`} 
                                alt={`Image ${blockIndex + 1} for ${post.title}`}
                                className="w-full h-24 object-cover rounded-md border-2 border-[#00FF00]/30"
                                onError={(e) => {
                                  console.error('Image load error:', block.content);
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </motion.div>
                      ))
                  ) : (
                    <motion.p
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      className="leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {post.content}
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
        ))}

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
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
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </motion.main>
    </div>
  );
}