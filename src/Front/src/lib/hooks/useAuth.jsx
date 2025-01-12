import { useEffect, useState, useContext } from "react";
import { Loader2 } from "lucide-react";
import { UserContext } from "@/lib/contexts/userContext";
import { BASE_API } from "../../config.json";
import Login from "../../routes/auth/Login";

export function useAuth() {
	return useContext(UserContext);
}

export function AuthWrapper({ children }) {
	const [isLoading, setIsLoading] = useState(false);
	const { user, updateUser } = useAuth();
	
	const auth = localStorage.getItem('token');
	if (window.location.pathname.startsWith('/auth') && auth) return window.location.replace('/blogs');

	useEffect(() => {
		if (!window.location.pathname.startsWith('/dash') || !auth || (user && user.id)) return;
		setIsLoading(true);

		async function getUser() {
			const data = await fetch(`${BASE_API}/user/me`, { method: 'GET', headers: { 'Authorization': `${auth}` } }).then(response => response.json()).catch(() => null);

			if (data?.id) {
				updateUser(data);
			}
			setIsLoading(false);
		}

		getUser();
	}, []);

	if (!window.location.pathname.startsWith('/dash')) return <>{children}</>;
	if (user && user.id) return <>{children}</>;
	if (!auth) return <Login />;

	return isLoading ? <Loader2 className="animate-spin" /> : user ? <>{children}</> : <Login />;
}

function Layout({ children }) {
	return <>
		{/* <Header /> */}
        <div className="flex">
			{/* <Sidebar /> */}
			<div className="flex items-center justify-between w-full h-full">
				{children}
			</div>
		</div>
	</>
}