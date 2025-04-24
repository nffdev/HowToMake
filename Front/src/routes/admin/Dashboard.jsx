import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import Header from "@/components/nav/Header";
import { motion } from "framer-motion";
import { BASE_API, OWNER_ID } from "../../config.json";

export default function AdminDashboard() {
    const navigate = useNavigate();

    const fetcher = (url) =>
        fetch(`${BASE_API}${url}`, {
            headers: { Authorization: `${localStorage.getItem("token")}` },
        }).then((response) => response.json());

    const { data: user } = useSWR('/user/me', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    const { data: blogs, isLoading: blogsLoading, mutate: refreshBlogs } = useSWR('/blogs', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    useEffect(() => {
        if (user && user.id && user.role !== 'admin' && user.role !== 'owner' && user.id !== OWNER_ID) {
            navigate('/');
        }
    }, [user, navigate]);

    const [newBlog, setNewBlog] = useState({
        title: '',
        content: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBlog(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const createNewBlog = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`${BASE_API}/blogs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify(newBlog)
            });
            
            if (response.ok) {
                setNewBlog({ title: '', content: '' });
                refreshBlogs();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to create blog'}`);
            }
        } catch (error) {
            console.error('Error creating blog:', error);
            alert('An error occurred while creating the blog');
        }
    };

    const deleteBlog = async (blogId) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) {
            return;
        }
        
        try {
            const response = await fetch(`${BASE_API}/blogs/${blogId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                refreshBlogs();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to delete blog'}`);
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('An error occurred while deleting the blog');
        }
    };

    if (!user) {
        return <div className="min-h-screen bg-black text-[#00FF00] p-8">Loading...</div>;
    }

    if (user && user.role !== 'admin' && user.role !== 'owner' && user.id !== OWNER_ID) {
        return null; 
    }

    return (
        <div className="min-h-screen bg-black text-[#00FF00] p-8">
            <Header user={user} />
            
            <motion.div
                className="max-w-5xl mx-auto mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold mb-8 border-b border-[#00FF00]/20 pb-4">Admin Dashboard</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div
                        className="bg-black/40 p-6 rounded-lg border border-[#00FF00]/20"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-xl font-semibold mb-4">Create New Blog</h2>
                        <form onSubmit={createNewBlog} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={newBlog.title}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-[#00FF00]/30 rounded-md p-2 text-[#00FF00] focus:ring-[#00FF00]"
                                    required
                                    maxLength={50}
                                />
                            </div>
                            <div>
                                <label htmlFor="content" className="block text-sm font-medium mb-1">Content</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={newBlog.content}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-[#00FF00]/30 rounded-md p-2 text-[#00FF00] h-32 focus:ring-[#00FF00]"
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="bg-[#00FF00] text-black px-4 py-2 rounded-md font-medium hover:bg-[#00FF00]/80 transition-colors"
                            >
                                Create Blog
                            </button>
                        </form>
                    </motion.div>
                    
                    <motion.div
                        className="bg-black/40 p-6 rounded-lg border border-[#00FF00]/20"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-xl font-semibold mb-4">Manage Blogs</h2>
                        {blogsLoading ? (
                            <p>Loading blogs...</p>
                        ) : blogs && blogs.length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {blogs.map(blog => (
                                    <div key={blog.id} className="border border-[#00FF00]/20 p-3 rounded-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium">{blog.title}</h3>
                                                <p className="text-xs text-[#00FF00]/60">{blog.createdAt}</p>
                                            </div>
                                            <button
                                                onClick={() => deleteBlog(blog.id)}
                                                className="text-red-500 hover:text-red-400 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No blogs found</p>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
