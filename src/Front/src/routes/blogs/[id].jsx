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
				<motion.time
					className="text-[#00FF00]/60 block mb-4 text-sm"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					{new Date(blog.createdAt).toLocaleDateString()}
				</motion.time>
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