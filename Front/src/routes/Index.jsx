import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';
import useSWR, { mutate } from "swr";
import Header from "@/components/nav/Header";
import { motion } from "framer-motion";
import { BASE_API } from "../config.json";

export default function Home() {
    const navigate = useNavigate();
    const [refreshKey, setRefreshKey] = useState(0);

    const fetcher = (url) =>
        fetch(`${BASE_API}${url}`, {
            headers: { Authorization: `${localStorage.getItem("token")}` },
        }).then((response) => response.json());

    const { data: user } = useSWR('/user/me', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    const { data: ownerBlogs, isLoading, mutate: mutateOwnerBlogs } = useSWR('/blogs/owner', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0,
        dedupingInterval: 0,
        key: `/blogs/owner?refresh=${refreshKey}`
    });

    useEffect(() => {
        const newBlogCreated = sessionStorage.getItem('newBlogCreated');
        if (newBlogCreated === 'true') {
            // console.log('New blog created, refreshing owner blogs');
            sessionStorage.removeItem('newBlogCreated');
            mutateOwnerBlogs();
            setRefreshKey(prev => prev + 1);
        }
    }, [mutateOwnerBlogs]);

    useEffect(() => {
        mutateOwnerBlogs();

        const interval = setInterval(() => {
            mutateOwnerBlogs();
        }, 5000);

        return () => clearInterval(interval);
    }, [mutateOwnerBlogs]);

    return (
        <div className="min-h-screen bg-black text-[#00FF00] p-8">
            <Header user={user} />
            {!user ? (
                <div className="flex flex-col gap-12 items-center justify-center mt-20">
                    <h1 className="text-5xl font-extrabold">HowToMake</h1>
                    <motion.button 
                        onClick={() => navigate('/auth/register')}
                        className="bg-[#00FF00] text-black px-6 py-2 rounded-md font-semibold hover:bg-[#00FF00]/80 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="mt-1">Start</span>
                    </motion.button>
                </div>
            ) : isLoading ? (
                <span>Loading...</span>
            ) : ownerBlogs && ownerBlogs.length > 0 ? (
                <>
                    <motion.div
                        className="border-b border-[#00FF00]/20 mb-8"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                    <motion.div className="max-w-3xl mx-auto">
                        <motion.button
                            onClick={() => navigate("/blogs")}
                            className="mb-4 flex items-center text-[#00FF00] hover:text-[#00FF00]/80 transition-colors"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 120, damping: 10 }}
                        >
                            <ArrowLeft className="mr-2" size={20} />
                            Explore All Users Blogs
                        </motion.button>
                        
                        <motion.h1
                            className="text-3xl font-bold mb-6 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            Owner's Blogs
                        </motion.h1>
                        
                        {ownerBlogs.map((blog, index) => (
                            <motion.article
                                key={blog.id}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ 
                                    type: "spring", 
                                    stiffness: 100, 
                                    damping: 12,
                                    delay: index * 0.1
                                }}
                                className="mb-12"
                            >
                                <motion.h2
                                    className="text-2xl font-bold mb-2 cursor-pointer"
                                    onClick={() => navigate(`/blogs/${blog.id}`)}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                >
                                    {blog.title}
                                </motion.h2>
                                
                                <div className="flex items-center mb-4">
                                    <motion.time
                                        className="text-[#00FF00]/60 text-sm mr-3"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                    >
                                        {blog.createdAt}
                                    </motion.time>
                                    <motion.span
                                        className="text-[#00FF00]/80 text-sm flex items-center"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.25 + index * 0.1 }}
                                    >
                                        <span className="inline-block w-2 h-2 bg-[#00FF00]/40 rounded-full mr-2"></span>
                                        By {blog.author.username}
                                    </motion.span>
                                </div>
                                
                                <div className="flex flex-col gap-4 mb-3">
                                    {blog.blocks && blog.blocks.length > 0 ? (
                                        blog.blocks
                                            .sort((a, b) => a.position - b.position)
                                            .map((block, blockIndex) => (
                                                <motion.div 
                                                    key={`${blog.id}-block-${blockIndex}`}
                                                    className="w-full"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.15 + (index * 0.05) + (blockIndex * 0.03) }}
                                                >
                                                    {block.type === 'text' ? (
                                                        <motion.p
                                                            style={{
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: 3,
                                                                WebkitBoxOrient: "vertical",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                            }}
                                                            className="leading-relaxed w-full"
                                                        >
                                                            {block.content}
                                                        </motion.p>
                                                    ) : block.type === 'image' && (
                                                        <div className="w-full md:max-w-[60%] mx-auto mb-3">
                                                            <img 
                                                                src={block.content.startsWith('http') ? block.content : `${BASE_API}${block.content}`} 
                                                                alt={`Image ${blockIndex + 1} for ${blog.title}`}
                                                                className="w-full max-h-40 object-cover rounded-md border-2 border-[#00FF00]/30"
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
                                        <div className="flex flex-col md:flex-row gap-4">
                                            {blog.imageUrl && (
                                                <motion.div
                                                    className="md:w-1/3 mb-3 md:mb-0"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.25 + index * 0.1 }}
                                                >
                                                    <img 
                                                        src={blog.imageUrl.startsWith('http') ? blog.imageUrl : `${BASE_API}${blog.imageUrl}`} 
                                                        alt={blog.title}
                                                        className="w-full max-h-40 object-cover rounded-md border-2 border-[#00FF00]/30"
                                                        onError={(e) => {
                                                            console.error('Image load error:', blog.imageUrl);
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </motion.div>
                                            )}
                                            <motion.p
                                                style={{
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                                className={`leading-relaxed ${blog.imageUrl ? 'md:w-2/3' : 'w-full'}`}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 + index * 0.1 }}
                                            >
                                                {blog.content}
                                            </motion.p>
                                        </div>
                                    )}
                                </div>
                                
                                <motion.button
                                    onClick={() => navigate(`/blogs/${blog.id}`)}
                                    className="text-[#00FF00]/80 hover:text-[#00FF00] text-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    whileHover={{ x: 5 }}
                                >
                                    Read more →
                                </motion.button>
                                
                                {index !== ownerBlogs.length - 1 && (
                                    <motion.div
                                        className="border-b border-[#00FF00]/20 mt-8"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                                    />
                                )}
                            </motion.article>
                        ))}
                    </motion.div>
                </>
            ) : (
                <span>The owner has not published any blogs yet.</span>
            )}
        </div>
    );
}