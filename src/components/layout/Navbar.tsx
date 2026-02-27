import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FaShoppingCart, FaSearch, FaBars, FaUser,
    FaCarrot, FaAppleAlt, FaFish, FaDrumstickBite, FaMugHot, FaLeaf, FaWineBottle, FaRecycle, FaHandHoldingHeart
} from 'react-icons/fa';
// marketApi import 추가
import { marketApi } from '../../api/market'; 

const CATEGORIES = [
    { name: '채소', icon: <FaCarrot />, path: '/market?category=vegetables' },
    { name: '과일·견과·쌀', icon: <FaAppleAlt />, path: '/market?category=fruits' },
    { name: '수산·해산·건어물', icon: <FaFish />, path: '/market?category=seafood' },
    { name: '정육·가공육·계란', icon: <FaDrumstickBite />, path: '/market?category=meat' },
    { name: '국·반찬·메인요리', icon: <FaMugHot />, path: '/market?category=sidedish' },
    { name: '샐러드·간편식', icon: <FaLeaf />, path: '/market?category=salad' },
    { name: '면·양념·오일', icon: <FaWineBottle />, path: '/market?category=seasoning' },
    { name: '제로웨이스트', icon: <FaRecycle className="text-green-600" />, path: '/market?category=zerowaste' },
    { name: '기부샵', icon: <FaHandHoldingHeart className="text-orange-500" />, path: '/market?category=donation' },
];

const NAV_LINKS = [
    { name: '베스트', path: '/market?sort=best' },
    { name: '신상', path: '/market?sort=new' },
    { name: '세일', path: '/market?sort=sale' },
    { name: '패션', path: '/market?category=fashion' },
    { name: '리빙', path: '/market?category=living' },
    { name: '특가/혜택', path: '/market?special=true' },
];

const Navbar = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token && token !== 'undefined' && token !== 'null');
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 80);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
// Navbar.tsx 내부의 handleSearch 수정
const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = searchTerm.trim();
    
    if (keyword) {
        try {
            const searchResults = await marketApi.getProducts({ page: 0, size: 10, keyword });
            console.log("검색 결과 데이터:", searchResults);

            // 현재 위치가 메인 화면('/')이면 메인 화면에서 결과 렌더링, 아니면 '/market'으로 이동
            const targetPath = location.pathname === '/' ? '/' : '/market';
            navigate(`${targetPath}?keyword=${encodeURIComponent(keyword)}`, {
                state: { initialData: searchResults }
            });
        } catch (error) {
            console.error("검색 중 오류가 발생했습니다:", error);
            const targetPath = location.pathname === '/' ? '/' : '/market';
            navigate(`${targetPath}?keyword=${encodeURIComponent(keyword)}`);
        } finally {
            setSearchTerm('');
        }
    }
};

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <header
            className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 font-sans text-slate-800 transition-transform duration-300 ease-in-out"
            style={{ transform: isScrolled ? `translateY(-104px)` : 'translateY(0)' }}
        >
            {/* Main Header (Desktop): Height exactly 104px */}
            <div className="hidden md:flex container mx-auto px-4 max-w-[1050px] h-[104px] items-center justify-between relative">
                {/* Left: Logo & Text */}
                <div className="flex items-center gap-3 shrink-0">
                    <Link to="/" className="text-4xl font-serif font-bold text-[#1D3130] tracking-tight">
                        Mossy
                    </Link>
                    <div className="text-[15px] font-semibold text-[var(--primary-color)] flex items-center gap-1 tracking-tight mt-2 ml-1">
                        <span>마켓모시</span>
                    </div>
                </div>

                {/* Center: Search Bar */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px]">
                    <form onSubmit={handleSearch} className="relative w-full group">
                        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] group-focus-within:text-[var(--primary-color)] transition-colors z-10" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="어떤 친환경 제품을 찾으시나요?"
                            className="w-full bg-[#f4f4f4] border border-transparent rounded-full py-[12px] pl-[46px] pr-[90px] text-[15px] focus:outline-none focus:bg-white focus:border-[var(--primary-color)] transition-all placeholder-slate-400"
                        />
                        <button type="submit" className="absolute right-[6px] top-1/2 -translate-y-1/2 bg-[#3B5240] text-white text-[14px] font-bold px-[18px] py-[6px] rounded-full hover:bg-[#2d4031] transition-colors" style={{ color: '#ffffff' }}>
                            검색
                        </button>
                    </form>
                </div>

                {/* Right: Custom Icons & Login/Logout Button */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Cart Icon (Circular) */}
                    <Link to="/cart" className="relative flex items-center justify-center w-[46px] h-[46px] bg-[#EBEBEB] rounded-full hover:bg-slate-200 transition-colors group">
                        <FaShoppingCart className="text-[1.2rem] text-[#2c2c2c] group-hover:text-[var(--primary-color)]" />
                        <span className="absolute -top-1 -right-0 w-[18px] h-[18px] rounded-full bg-[#004225] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">0</span>
                    </Link>

                    {/* User Icon (Circular) */}
                    <Link to={isLoggedIn ? "/mypage" : "/login"} className="flex items-center justify-center w-[46px] h-[46px] bg-[#EBEBEB] rounded-full hover:bg-slate-200 transition-colors group">
                        <FaUser className="text-[1.2rem] text-[#2c2c2c] group-hover:text-[var(--primary-color)]" />
                    </Link>

                    {/* Login/Logout Button */}
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="ml-2 px-6 py-[10px] bg-[#3B5240] rounded-full hover:bg-[#2d4031] transition-colors whitespace-nowrap"
                        >
                            <span className="text-[15px] font-bold" style={{ color: '#ffffff' }}>Log out</span>
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="ml-2 px-6 py-[10px] bg-[#3B5240] rounded-full hover:bg-[#2d4031] transition-colors whitespace-nowrap"
                        >
                            <span className="text-[15px] font-bold" style={{ color: '#ffffff' }}>Log in</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="container mx-auto px-4 max-w-[1050px] h-14 md:h-[56px] flex items-center justify-between relative">

                {/* Mobile Header (Shows only on mobile) */}
                <div className="md:hidden flex items-center justify-between w-full h-full pb-4">
                    <div className="flex items-center gap-4">
                        <button className="text-slate-800 text-xl font-bold">
                            <FaBars />
                        </button>
                        <Link to="/" className="text-2xl font-serif font-bold text-[#1D3130] tracking-tight">
                            Mossy
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-slate-800" onClick={() => navigate('/search')}>
                            <FaSearch className="text-lg" />
                        </button>
                        <Link to={isLoggedIn ? "/mypage" : "/login"} className="hover:text-[var(--primary-color)] transition-colors">
                            <FaUser className="text-lg" />
                        </Link>
                        <Link to="/cart" className="relative hover:text-[var(--primary-color)] transition-colors">
                            <FaShoppingCart className="text-xl" />
                            <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[var(--primary-color)] text-white text-[10px] font-bold flex items-center justify-center">0</span>
                        </Link>
                    </div>
                </div>

                {/* Desktop Bottom Nav */}
                <div className="hidden md:flex items-center w-full h-full relative">
                    {/* Left: Category Toggle & Mega Menu */}
                    <div className="group h-full flex items-center relative gap-3 cursor-pointer text-slate-800 hover:text-[var(--primary-color)] transition-colors pr-8">
                        <FaBars className="text-xl" />
                        <span className="font-semibold text-[15px]">카테고리</span>

                        {/* Mega Menu Dropdown */}
                        <div className="hidden group-hover:block absolute top-[calc(100%-1px)] left-0 w-64 bg-white/95 backdrop-blur-md shadow-xl rounded-b-lg overflow-hidden py-2 animate-fade-in z-50 border border-slate-100">
                            {CATEGORIES.map((cat, idx) => (
                                <Link
                                    key={idx}
                                    to={cat.path}
                                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 hover:text-[var(--primary-color)] hover:font-bold transition-colors text-sm text-slate-600"
                                >
                                    <span className="text-lg opacity-70 w-6 flex justify-center">{cat.icon}</span>
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Center: Nav Links */}
                    <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-10 lg:gap-14 h-full">
                        {NAV_LINKS.map(link => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-[15px] font-semibold text-slate-700 hover:text-[var(--primary-color)] hover:underline hover:underline-offset-4 transition-all h-full flex items-center whitespace-nowrap"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: Scrolled Elements (Shows only when isScrolled is true) */}
                    <div className={`absolute right-0 flex items-center gap-5 transition-opacity duration-300 ${isScrolled ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                        {/* Compact Search Bar */}
                        <form onSubmit={handleSearch} className="relative w-[220px]">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="어떤 친환경 제품을 찾..."
                                className="w-full bg-[#f4f4f4] border border-transparent rounded-full py-[8px] pl-4 pr-10 text-[13px] focus:outline-none focus:bg-white focus:border-[var(--primary-color)] transition-all"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[var(--primary-color)] transition-colors">
                                <FaSearch size={14} />
                            </button>
                        </form>

                        {/* Compact Icons */}
                        <div className="flex items-center gap-4">
                            <Link to={isLoggedIn ? "/mypage" : "/login"} className="text-slate-700 hover:text-[var(--primary-color)] transition-colors">
                                <FaUser className="text-[1.2rem]" />
                            </Link>
                            <Link to="/cart" className="relative text-slate-700 hover:text-[var(--primary-color)] transition-colors">
                                <FaShoppingCart className="text-[1.3rem]" />
                                <span className="absolute -top-1 -right-2 w-[16px] h-[16px] rounded-full bg-[#004225] text-white text-[9px] font-bold flex items-center justify-center border border-white">0</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;