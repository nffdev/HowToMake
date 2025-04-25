import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';
import useSWR from "swr";
import Header from "@/components/nav/Header";
import { motion } from "framer-motion";
import { BASE_API } from "../../config.json";

export default function BlogDetail() {
  	const { id } = useParams();
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

	const { data: blog, isLoading } = useSWR(`/blogs/${id}`, fetcher, {
		revalidateIfStale: false,
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
	});

	return (
		<div className="min-h-screen bg-black text-[#00FF00] p-8">
		<Header user={user} />
		{isLoading ? <span>Loading...</span> : blog?.id ? <>
			<motion.div
				className="border-b border-[#00FF00]/20 mb-8"
				initial={{ scaleX: 0 }}
				animate={{ scaleX: 1 }}
				transition={{ duration: 0.5 }}
			/>
			<motion.article
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ type: "spring", stiffness: 100, damping: 12 }}
				className="max-w-3xl mx-auto"
			>
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
				<motion.h1
					className="text-4xl font-bold mb-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.1 }}
				>
					{blog.title}
				</motion.h1>
				<div className="flex items-center mb-6">
					<motion.time
						className="text-[#00FF00]/60 text-sm mr-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						{new Date(blog.createdAt).toLocaleDateString()}
					</motion.time>
					<motion.div
						className="flex items-center"
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.3 }}
					>
						<span className="inline-block w-2 h-2 bg-[#00FF00]/40 rounded-full mr-2"></span>
						<span className="text-[#00FF00]/80 text-sm">Written by <span className="font-medium">{blog.author.username}</span></span>
					</motion.div>
				</div>
				{blog.imageUrl && (
					<motion.div
						className="mb-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.25 }}
					>
						<img 
							src={blog.imageUrl.startsWith('http') ? blog.imageUrl : `${BASE_API}${blog.imageUrl}`} 
							alt={blog.title} 
							className="max-w-full rounded-md border-2 border-[#00FF00]/30 shadow-lg shadow-[#00FF00]/10"
							onError={(e) => {
								console.error('Image load error:', blog.imageUrl);
								e.target.style.display = 'none';
							}}
						/>
					</motion.div>
				)}
				<motion.div
					className="text-lg leading-relaxed"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					{blog.content}
				</motion.div>
			</motion.article>
		</> : <span>There is no blog with this id.</span>}
		</div>
	);
}