import React from 'react';
import { useAuth } from "@/lib/hooks/useAuth";
import Header from "@/components/nav/Header";
import { motion } from 'framer-motion';

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
  }
];

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

export default function Blog() {
    const { user } = useAuth();

    return (
        <div className="mx-auto px-4 min-h-screen bg-black text-[#00FF00] overflow-x-hidden">
          <motion.main 
            className="py-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <Header />
            <motion.div 
              className="border-b border-[#00FF00]/20 mb-8"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            {posts.map((post, index) => (
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
                      className="text-xl mb-1"
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
                      {post.date}
                    </motion.time>
                    <motion.p 
                      className="leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {post.content}
                    </motion.p>
                  </div>
                </div>
    
                {index !== posts.length - 1 && (
                  <motion.div 
                    className="border-b border-[#00FF00]/20 mt-16"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  />
                )}
              </motion.article>
            ))}
          </motion.main>
        </div>
    );
}
