import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // useSearchParams 추가
import { marketApi, type ProductResponse } from '../../api/market';
import { cartApi } from '../../api/cart';
import { ProductCard } from '../../components/ProductCard';
import { Button } from '../../components/Button';

const HomePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();           // URL 파라미터 읽기
    const keyword = searchParams.get('keyword');        // 'keyword' 값 추출

    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token && token !== 'undefined' && token !== 'null');

        const fetchProducts = async () => {
            setLoading(true);
            try {
                // keyword가 있으면 해당 키워드로 검색, 없으면 기본 추천(top 10) 상품 가져오기
                const data = await marketApi.getProducts({ 
                    page: 0, 
                    size: keyword ? 20 : 10, 
                    keyword: keyword || undefined 
                });
                setProducts(data.data.content);
            } catch (error) {
                console.error("Failed to fetch home products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [keyword]); // keyword가 변경될 때마다 API 재요청

    const addToCart = async (e: React.MouseEvent, productId: number) => {
        e.preventDefault();
        try {
            await cartApi.addToCart(productId, 1);
            if (window.confirm('장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?')) {
                window.location.href = '/cart';
            }
        } catch (err: any) {
            console.error(err);
            if (err.message === "로그인이 필요합니다." || err.response?.status === 401) {
                alert("로그인이 필요합니다.");
                window.location.href = '/login';
            } else {
                alert('장바구니 담기 실패: ' + (err.message || '오류가 발생했습니다.'));
            }
        }
    };

    // 🌟 1. 검색어가 있을 경우: 검색 결과 화면 렌더링
    if (keyword) {
        return (
            <div className="pb-0 bg-[var(--background-color)] min-h-[80vh] pt-10">
                <div className="container mx-auto px-4 max-w-[1050px]">
                    <h2 className="text-[24px] font-bold text-[#333] mb-8">
                        <span className="text-[var(--primary-color)]">'{keyword}'</span> 검색 결과
                    </h2>
                    
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px]">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-[4/5] bg-slate-200 rounded-[8px] animate-pulse"></div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-[18px]">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center text-slate-500 text-lg">
                            검색된 상품이 없습니다. 다른 키워드로 검색해보세요!
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 🌟 2. 검색어가 없을 경우: 기존 메인 화면 렌더링
    return (
        <div className="pb-0 bg-[var(--background-color)]">
            {/* 1. Hero Banner */}
            <div className="relative min-h-[35vh] xl:min-h-[45vh] w-full flex flex-col justify-center items-center text-white text-center mb-16 bg-cover bg-center pb-8 pt-6"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1470058869958-2a77ade41c02?q=80&w=2070&auto=format&fit=crop)' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-[var(--background-color)]"></div>
                <div className="relative z-10 w-full max-w-5xl px-6 transform -translate-y-4">
                    <span className="inline-block py-1 px-3 border border-white/30 rounded-full text-sm font-medium tracking-widest mb-6 backdrop-blur-sm">PREMIUM ECO LIFESTYLE</span>
                    <h1 className="text-7xl md:text-9xl font-serif mb-5 !text-white drop-shadow-2xl font-bold tracking-tight">Mossy</h1>
                    <p className="text-xl md:text-2xl font-light opacity-90 max-w-2xl mx-auto leading-snug">자연을 닮은 현명한 소비,<br />지속 가능한 일상을 시작하세요.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-[1050px]">
                {/* 2. Popular / AI Recommendations */}
                <div className="mb-20 pt-10">
                    <div className="text-center mb-8">
                        <h2 className="text-[28px] font-bold text-[#333] flex justify-center items-center gap-2">
                            {isLoggedIn ? '✨ 나를 위한 AI 맞춤 추천' : '🏆 실시간 인기 랭킹 🏆'}
                        </h2>
                        <p className="text-[15px] text-[#999] mt-2">
                            {isLoggedIn ? '최근 장바구니에 담은 상품과 비슷한 취향이에요!' : '가장 인기있는 상품만 모아보세요!'}
                        </p>
                    </div>

                    <div className="relative">
                        {loading ? (
                            <div className="flex gap-4 overflow-hidden">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="min-w-[250px] aspect-[4/5] bg-slate-200 rounded-[8px] animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex gap-[18px] overflow-x-auto pb-6 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                                {products.slice(0, 5).map((product, idx) => (
                                    <div key={product.id} className="min-w-[250px] snap-start relative">
                                        <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-[var(--primary-color)] text-white font-bold flex items-center justify-center shadow-lg z-10 text-lg">
                                            {idx + 1}
                                        </div>
                                        <ProductCard product={product} onAddToCart={addToCart} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. New Arrivals -> Category Best */}
                <div className="mb-24">
                    <div className="text-center mb-10 flex flex-col items-center">
                        <h2 className="text-[28px] font-bold text-[#333] flex items-center gap-1 cursor-pointer group">
                            🎖️ 카테고리 베스트 <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity translate-y-[2px]"> &gt;</span>
                        </h2>
                        <p className="text-[15px] text-[#999] mt-2">지금 가장 사랑받는 카테고리별 1위 상품</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px]">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="aspect-[4/5] bg-slate-200 rounded-[8px] animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-[18px]">
                            {products.slice(5, 9).map(product => (
                                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. Brand Highlight */}
                <div className="mb-32 p-12 lg:p-24 rounded-[3rem] bg-[#e6f4ea] flex flex-col md:flex-row items-center justify-between gap-16 relative overflow-visible">
                    <div className="max-w-xl relative z-10 order-2 md:order-1">
                        <span className="inline-block px-4 py-1.5 bg-[var(--primary-color)] text-white rounded-full text-xs font-bold uppercase tracking-wider mb-8 shadow-lg">Story</span>
                        <h2 className="text-5xl lg:text-6xl font-serif font-bold mb-8 text-slate-900 leading-tight">GreenMate<br /><span className="text-[var(--success-color)] text-4xl lg:text-5xl opacity-80">With Nature</span></h2>
                        <p className="text-xl text-slate-700 mb-10 leading-relaxed font-light">
                            지속 가능한 내일을 위해 노력하는 그린메이트의 이야기를 만나보세요.
                            작은 실천이 모여 큰 숲을 이룹니다.
                        </p>
                        <Button size="lg">브랜드 스토리 보기</Button>
                    </div>

                    <div className="order-1 md:order-2 w-full max-w-lg relative block">
                        <div className="absolute inset-0 bg-[var(--primary-color)] rounded-[2rem] transform rotate-6 scale-95 opacity-20 blur-xl"></div>
                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700">
                            <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop" alt="Green Brand" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* 5. Popular Search Terms */}
                <div className="mb-32 text-center">
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest" style={{ marginBottom: '60px' }}>Trending Keywords</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['#텀블러', '#친환경주방', '#업사이클', '#대나무칫솔', '#플라스틱프리'].map(tag => (
                            <span key={tag}
                                className="px-6 py-3 rounded-full bg-white border border-[var(--border-color)] text-[var(--text-muted)] cursor-pointer transition-all hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] hover:shadow-md text-sm font-medium"
                                // 파라미터 이름을 search에서 keyword로 통일
                                onClick={() => navigate(`/?keyword=${encodeURIComponent(tag.replace('#', ''))}`)}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;