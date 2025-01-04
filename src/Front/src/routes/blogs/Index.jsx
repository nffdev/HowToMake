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
} from "@/components/ui/pagination"
import { BASE_API } from "../../config.json";

const posts = [
  {
    title: "THE STORY BEHIND BLACKOUT: ABUSING GMER DRIVER TO TERMINATE PROTECTED PROCESSES",
    date: "May 3, 2024",
    content: "During a ransomware incident response, I noticed a file with a strange name that was retrieved by the team. Upon inspection, it turned out to be a driver. This raised the question \"what does a driver have to do with a ransomware incident response?\" To understand this, I…"
  },
  {
    title: "ALPHV MALWARE ANALYSIS REPORT",
    date: "June 26, 2023",
    content: "Description The file is a 32-bit Windows executable that contains BlackCat Ransomware. BlackCat, also known as Noberus or ALPHV, is a sophisticated ransomware family programmed in Rust and deployed as part of Ransomware as a Service (RaaS) operations on Windows. The ransomware can be configured to encrypt files using..."
  },
  {
    title: "NEW RANSOMWARE STRAIN DISCOVERED",
    date: "July 15, 2024",
    content: "A new ransomware strain has been discovered in the wild, targeting critical infrastructure. Initial analysis shows sophisticated encryption methods and evasion techniques..."
  },
  {
    title: "CYBERSECURITY TRENDS FOR 2025",
    date: "December 31, 2024",
    content: "As we approach 2025, several cybersecurity trends are emerging. AI-driven threat detection, quantum-resistant encryption, and decentralized identity management are at the forefront..."
  }
];

const POSTS_PER_PAGE = 2;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const articleVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

const gridItemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
};

export default function Blogs() {
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const fetcher = (url) => fetch(`${BASE_API}${url}`, { headers: { 'Authorization': `${localStorage.getItem('token')}` } }).then(response => response.json());

    const { data: user } = useSWR('/user/me', fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    });

    const { data: posts, isLoading } = useSWR('/blogs', fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    });

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
              <motion.article key={index} className="relative mb-16 px-4" variants={articleVariants}>
                <div className="grid grid-cols-[auto,1fr] gap-4">
                  <div className="grid grid-cols-3 gap-2 text-[#00FF00]/20">
                    {[...Array(9)].map((_, i) => (
                      <motion.span 
                        key={i}
                        variants={gridItemVariants}
                        whileHover={{ scale: 1.2, color: '#00FF00' }}
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
                      transition={{ type: 'spring', stiffness: 300 }}
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
                      style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      className="leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {post.content}
                    </motion.p>
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
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
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
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </motion.main>
        </div>
    );
}
