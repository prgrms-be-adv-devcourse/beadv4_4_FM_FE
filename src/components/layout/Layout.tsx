import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getRolesFromToken } from '../../utils/auth';
import { useEffect } from 'react';

const Layout = () => {
    const location = useLocation();
    const isAdminMode = location.pathname.startsWith('/admin');

    useEffect(() => {
        let scrollTimeout: ReturnType<typeof setTimeout>;
        const handleScroll = () => {
            document.documentElement.classList.add('is-scrolling');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.documentElement.classList.remove('is-scrolling');
            }, 800);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    if (isAdminMode) {
        return <Outlet />;
    }

    const userRoles = getRolesFromToken();
    if (userRoles.includes('ROLE_PENDING') && !location.pathname.startsWith('/signup/complete') && !location.pathname.startsWith('/auth/callback')) {
        return <Navigate to="/signup/complete" replace />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background-color text-text-main font-sans">
            <Navbar />

            <main className="flex-1 w-full relative">
                <div className="w-full h-full">
                    <Outlet />
                </div>
            </main>

            <footer className="w-full mt-auto flex flex-col">
                <div className="bg-[#0F2A1F] text-[#89B18A] py-16">
                    <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-start gap-10">

                        {/* Left: Logo & Info */}
                        <div>
                            <h2 className="text-[#89B18A] text-4xl mb-6 font-serif font-bold tracking-tight">Mossy</h2>
                            <div className="space-y-2 text-[14px] font-light">
                                <p>서초구 반포대로 45 명정빌딩 3층</p>
                                <p>사업자등록번호: 123-45-67890</p>
                                <p>통신판매업신고: 2026-서울서초-0000</p>
                            </div>
                        </div>

                        {/* Right: Links & Copyright */}
                        <div className="md:mt-4 flex flex-col items-end">
                            <div className="flex flex-wrap justify-end gap-8 text-[15px] font-medium mb-12">
                                <a href="#" className="hover:text-white transition-colors">About Us</a>
                                <a href="#" className="hover:text-white transition-colors">Terms</a>
                                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                                <a href="#" className="hover:text-white transition-colors">Help</a>
                            </div>
                            <p className="text-[13px] font-light opacity-80">
                                &copy; {new Date().getFullYear()} Mossy Store. All rights reserved.
                            </p>
                        </div>

                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
