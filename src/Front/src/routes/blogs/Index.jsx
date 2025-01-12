import React, { useState } from 'react';
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

  const totalPages = Math.ceil(posts?.length || 0 / POSTS_PER_PAGE);
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
                {[...Array(9)].map((_, i) => (
                  <motion.span
                    key={i}
                    variants={gridItemVariants}
                    whileHover={{ scale: 1.2, color: "#00FF00" }}
                  >
                    +
                  </motion.span>
                ))}
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
                <motion.time
                  className="text-[#00FF00]/60 block mb-4 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {post.createdAt}
                </motion.time>
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