import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { FaLeaf, FaGlobeAmericas, FaHeart } from 'react-icons/fa';
import { authApi } from '../../api/auth';
import { getRolesFromToken } from '../../utils/auth';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (searchParams.get('status') === 'error') {
            alert('다시 시도해주세요');
            searchParams.delete('status');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const handleLogin = async () => {
        try {
            const response = await authApi.login({ email, password });
            if (response.resultCode.startsWith('S-200') || response.resultCode.startsWith('200')) {
                localStorage.setItem('accessToken', response.data.accessToken);
                // refreshToken is now handled by HttpOnly cookie
                if (response.data.nickname) {
                    localStorage.setItem('nickname', response.data.nickname);
                }

                // Redirect based on role
                const userRoles = getRolesFromToken(response.data.accessToken);
                console.log('[Login] User roles after login:', userRoles);

                if (userRoles.includes('ADMIN') || userRoles.includes('ROLE_ADMIN')) {
                    console.log('[Login] Admin detected. Redirecting to dashboard.');
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    const from = (location.state as any)?.from?.pathname || '/';
                    console.log(`[Login] Not an admin. Redirecting to: ${from}`);
                    navigate(from, { replace: true });
                }
            } else {
                setError('로그인 실패: ' + response.msg);
            }
        } catch (err: any) {
            console.error('Login error details:', err);
            console.error('Response data:', err.response?.data);

            const errorMsg = err.response?.data?.msg || err.response?.data?.message || err.message || '로그인 중 오류가 발생했습니다.';
            setError(`로그인 실패: ${errorMsg}`);
        }
    };
    return (
        <div className="relative flex-1 flex flex-col justify-center py-12">
            {/* Top subtle background overlay */}
            <div
                className="absolute top-0 left-0 w-full h-full bg-cover bg-center pointer-events-none -z-10"
                style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1470058869958-2a77ade41c02?q=80&w=2070&auto=format&fit=crop)',
                    opacity: 0.08,
                    maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)'
                }}
            ></div>

            <div className="container mx-auto px-4 max-w-[1020px] my-auto py-12">
                {/* Breadcrumb */}
                <div className="text-[13px] text-slate-500 mb-6 mt-4">
                    <Link to="/" className="hover:text-[var(--primary-color)] transition-colors">홈</Link> / <span className="text-slate-800 font-medium">로그인</span>
                </div>

                {/* Main Card Container */}
                <div className="flex flex-col md:flex-row border border-slate-200 rounded-2xl bg-white/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.03)] overflow-hidden">

                    {/* Left Column: Returning Customer (Login Form) */}
                    <div className="flex-1 p-8 lg:p-14 border-b md:border-b-0 md:border-r border-slate-200">
                        <h2 className="text-[30px] font-bold text-[#3B5240] mb-14 font-serif">기존 회원 로그인</h2>

                        <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                            <div className="flex flex-col gap-2 mb-8">
                                <label className="text-[15px] text-slate-700 font-medium">이메일 주소</label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-[14px] lg:p-[16px] border border-slate-300 rounded-[8px] focus:outline-none focus:border-[#3B5240] focus:ring-1 focus:ring-[#3B5240] transition-all text-[15px] bg-white/50"
                                />
                            </div>

                            <div className="flex flex-col gap-2 relative mb-2">
                                <label className="text-[15px] text-slate-700 font-medium">비밀번호</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-[14px] lg:p-[16px] border border-slate-300 rounded-[8px] focus:outline-none focus:border-[#3B5240] focus:ring-1 focus:ring-[#3B5240] transition-all text-[15px] bg-white/50"
                                />
                                {/* Dummy eye icon */}
                                <div className="absolute right-4 top-[48px] text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </div>
                            </div>

                            {error && <div className="text-[#FA622F] text-[14px] font-medium mb-2">{error}</div>}

                            <div className="mb-4">
                                <a href="#" className="text-[14px] text-slate-500 underline underline-offset-4 hover:text-[#3B5240] transition-colors">비밀번호 찾기</a>
                            </div>

                            <button
                                type="submit"
                                className="bg-[#3B5240] text-white font-bold text-[17px] py-[16px] px-12 rounded-full w-fit hover:bg-[#2d4031] transition-colors"
                            >
                                로그인
                            </button>
                        </form>

                        {/* Social Login Section */}
                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <p className="text-[14px] text-slate-500 mb-5 text-center">또는 간편하게 로그인하기</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={() => window.location.href = 'http://localhost:8086/oauth2/authorization/google'}
                                    className="flex-1 flex items-center justify-center gap-2 p-[12px] border border-slate-300 rounded-[8px] bg-white hover:bg-slate-50 transition-colors text-[15px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                >
                                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4" />
                                        <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853" />
                                        <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05" />
                                        <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335" />
                                    </svg>
                                    Google
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.location.href = 'http://localhost:8086/oauth2/authorization/kakao'}
                                    className="flex-1 flex items-center justify-center gap-2 p-[12px] rounded-[8px] bg-[#FEE500] hover:bg-[#e5ce00] transition-colors text-[15px] font-medium text-[#191919] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                >
                                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 2C4.029 2 0 5.15 0 9.038c0 2.508 1.637 4.706 4.12 5.922-.142.482-.519 1.83-.553 1.968-.043.167.06.162.128.118.053-.035 1.705-1.144 2.39-1.613.626.084 1.258.125 1.915.125 4.971 0 9-3.15 9-7.038C18 5.15 13.971 2 9 2z" fill="#000000" />
                                    </svg>
                                    카카오
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: New to Mossy (Signup Prompt) */}
                    <div className="flex-1 bg-slate-50/80 p-8 lg:p-14 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex -space-x-2">
                                <div className="w-[42px] h-[42px] rounded-full bg-green-100 flex items-center justify-center border-2 border-slate-50 z-20 shadow-sm">
                                    <FaLeaf className="text-[18px] text-[#3B5240]" />
                                </div>
                                <div className="w-[42px] h-[42px] rounded-full bg-blue-100 flex items-center justify-center border-2 border-slate-50 z-10 shadow-sm">
                                    <FaGlobeAmericas className="text-[18px] text-blue-500" />
                                </div>
                                <div className="w-[42px] h-[42px] rounded-full bg-orange-100 flex items-center justify-center border-2 border-slate-50 z-0 shadow-sm">
                                    <FaHeart className="text-[18px] text-orange-400" />
                                </div>
                            </div>
                        </div>

                        <h2 className="text-[30px] font-bold text-[#3B5240] font-serif mb-6">모시가 처음이신가요?</h2>

                        <p className="text-[16px] text-slate-600 leading-relaxed mb-10">
                            <strong>친환경 상품 구매, 탄소 절감 및 기부 내역</strong>을 한눈에 확인하세요.<br /><br />
                            <span className="font-light">지속 가능한 내일을 위한 첫 걸음,<br />지금 바로 시작해보세요!</span>
                        </p>

                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-[#3B5240] text-white font-bold text-[17px] py-[16px] px-12 rounded-full w-fit hover:bg-[#2d4031] transition-colors"
                        >
                            회원가입
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
