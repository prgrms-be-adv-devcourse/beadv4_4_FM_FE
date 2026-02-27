import { useEffect, useState } from 'react';
import { cartApi, type CartResponse } from '../../api/cart';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCart = async () => {
        try {
            const response = await cartApi.getCart();
            // console.log("Cart API Response:", response);
            if (response && response.data) {
                setCart(response.data);
            }
        } catch (err: any) {
            console.error("Failed to fetch cart", err);

            // 404 means the cart hasn't been created yet / is completely empty
            if (err.response?.status === 404 || err.response?.data?.errorCode === 'CART_NOT_FOUND') {
                setCart({
                    id: 0,
                    userId: 0,
                    items: [],
                    totalPrice: 0
                } as any);
                return;
            }

            if (err.message === "로그인이 필요합니다." || err.response?.status === 401) {
                alert("로그인이 필요합니다.");
                navigate('/login');
            } else {
                setError("장바구니를 불러오지 못했습니다. " + (err.message || ""));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleRemove = async (productId: number) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await cartApi.removeFromCart(productId);
            fetchCart(); // Refresh cart
        } catch (err) {
            console.error("Failed to remove item", err);
            alert("상품 삭제에 실패했습니다.");
        }
    };

    const handleOrder = async (type: 'TOSS' | 'CASH') => {
        if (!cart || cart.items.length === 0) {
            alert("장바구니가 비어있습니다.");
            return;
        }

        // Backend Validation Guard: Check if any item is missing weight
        const itemsWithMissingWeight = cart.items.filter(item => item.weight === undefined || item.weight === null);
        if (itemsWithMissingWeight.length > 0) {
            const productNames = itemsWithMissingWeight.map(i => i.productName).join(', ');
            alert(`다음 상품의 무게 정보가 없어 주문할 수 없습니다:\n${productNames}\n\n관리자에게 문의해주세요.`);
            return;
        }

        if (!window.confirm(type === 'TOSS' ? "주문하시겠습니까?" : "예치금으로 결제하시겠습니까?")) return;

        try {

            // Calculate total price
            const requestTotalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const orderItems = cart.items.map(item => ({
                productId: item.productId,
                sellerId: item.sellerId,
                productName: item.productName,
                categoryName: item.categoryName || "",
                price: item.price,
                weight: item.weight || 0,
                thumbnailUrl: item.thumbnailUrl || "",
                quantity: item.quantity
            }));

            const orderRequest = {
                totalPrice: requestTotalPrice,
                paymentType: type === 'TOSS' ? "CARD" : "CASH",
                items: orderItems
            };

            console.log('Order request:', orderRequest);

            const orderResponse = await import('../../api/order').then(({ orderApi }) => orderApi.createOrder(orderRequest));

            if (!orderResponse.data || !orderResponse.data.orderId) {
                throw new Error('주문 생성에 실패했습니다.');
            }

            const { orderId, orderNo, totalPrice } = orderResponse.data;
            console.log('Order created:', orderId, orderNo, totalPrice);

            // Add timestamp to orderNo to prevent duplicate payment attempts
            // Backend parser uses __ (double underscore) as delimiter
            const uniqueOrderId = `${orderNo}__${Date.now()}`;

            if (type === 'TOSS') {
                // Initialize Toss Payments
                const { loadTossPayments } = await import('@tosspayments/payment-sdk');
                const { TOSS_CLIENT_KEY } = await import('../../api/payment');

                const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);

                // Launch payment widget
                await tossPayments.requestPayment('카드', {
                    amount: totalPrice,
                    orderId: uniqueOrderId,
                    orderName: `주문 ${orderNo}`,
                    successUrl: `${window.location.origin}/payment/success`,
                    failUrl: `${window.location.origin}/payment/fail`,
                });
            } else {
                // Cash Payment - auto-processed during order creation
                // No need to call confirmCashPayment API

                // Redirect to success page manually
                navigate(`/payment/success?orderId=${uniqueOrderId}&amount=${totalPrice}&method=CASH&status=DONE`);
            }

            // Clear cart after payment widget opens
            setCart(null);
        } catch (err: any) {
            console.error("Order failed", err);
            console.error("Error response:", err.response?.data);

            if (type === 'CASH') {
                navigate(`/payment/fail?message=${encodeURIComponent(err.response?.data?.msg || err.message || "예치금 결제 실패")}`);
            } else {
                alert("주문 접수 중 오류가 발생했습니다.\n" + (err.response?.data?.msg || err.message));
            }
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm("장바구니를 모두 비우시겠습니까?")) return;
        try {
            await cartApi.clearCart();
            fetchCart(); // Refresh
        } catch (err: any) {
            console.error("Failed to clear cart", err);
            alert("장바구니 비우기에 실패했습니다: " + (err.response?.data?.msg || err.message));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] mt-20">
                <div className="text-lg text-[var(--text-muted)] animate-pulse">장바구니를 불러오는 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] mt-20">
                <div className="text-lg text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background-color)] pb-20" style={{ paddingTop: '140px' }}>
            <div className="container mx-auto px-4 max-w-5xl">
                <h1 className="text-4xl font-serif font-bold text-[var(--text-main)]" style={{ marginBottom: '50px' }}>
                    장바구니
                </h1>

                {cart && cart.items && cart.items.length > 0 ? (
                    <div className="max-w-4xl mx-auto">
                        {/* Cart Items List */}
                        <ul className="space-y-6 mb-16">
                            {cart.items.map(item => (
                                <li key={item.productId} className="group flex flex-col sm:flex-row items-center gap-8 p-8 bg-white rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">

                                    {/* Image */}
                                    <div className="w-32 h-32 bg-[#f1f5f9] rounded-[var(--radius-md)] flex items-center justify-center overflow-hidden flex-shrink-0 relative shadow-inner">
                                        {item.thumbnailUrl ? (
                                            <img
                                                src={item.thumbnailUrl}
                                                alt={item.productName}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null;
                                                    target.style.display = 'none';
                                                    target.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}

                                        {/* Fallback Icon */}
                                        <div className={`absolute inset-0 flex flex-col items-center justify-center text-[var(--secondary-color)] bg-[#f1f5f9] ${item.thumbnailUrl ? 'hidden' : ''}`}>
                                            <span className="text-4xl opacity-20">🌿</span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 text-center sm:text-left w-full min-w-0">
                                        <div className="text-xs font-bold text-[var(--accent-color)] uppercase tracking-wider mb-2">{item.categoryName || 'Natural Product'}</div>
                                        <h3 className="text-2xl font-serif font-medium text-[var(--text-main)] mb-2 group-hover:text-[var(--primary-color)] transition-colors">{item.productName}</h3>
                                        <p className="text-xl font-bold text-[var(--primary-color)]">
                                            {(item.totalPrice ?? 0).toLocaleString()} 원
                                        </p>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex flex-row sm:flex-col items-center gap-3 w-full sm:w-auto justify-between sm:justify-center border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0 mt-2 sm:mt-0">
                                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                                            <span className="text-xs text-[var(--text-muted)] uppercase font-semibold">Qty</span>
                                            <span className="font-bold text-[var(--text-main)]">{item.quantity}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item.productId)}
                                            className="text-sm text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition-all flex items-center gap-1"
                                        >
                                            <span className="hidden sm:inline">Remove</span>
                                            <span className="sm:hidden">삭제</span>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* Actions */}
                        <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-6 border-t border-[var(--border-color)] pt-12">
                            <button
                                onClick={() => navigate('/market')}
                                className="w-full sm:w-auto px-6 py-4 rounded-full border border-[var(--border-color)] text-[var(--text-muted)] font-medium hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-all"
                            >
                                &larr; 쇼핑 계속하기
                            </button>

                            <button
                                onClick={handleClearCart}
                                className="w-full sm:w-auto px-6 py-4 rounded-full border border-red-200 text-red-500 bg-red-50 font-medium hover:bg-red-100 hover:border-red-300 transition-all"
                            >
                                장바구니 비우기
                            </button>

                            <button
                                onClick={() => handleOrder('TOSS')}
                                className="w-full sm:w-auto btn btn-primary px-12 py-4 text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                            >
                                PG 주문하기
                            </button>
                            <button
                                onClick={() => handleOrder('CASH')}
                                className="w-full sm:w-auto px-12 py-4 text-xl rounded-full bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                            >
                                예치금 결제
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-sm">
                        <div className="text-6xl mb-6 opacity-20">🛒</div>
                        <p className="text-xl font-medium text-[var(--text-muted)] mb-8">장바구니가 비어있습니다.</p>
                        <button onClick={() => navigate('/market')} className="btn btn-primary px-10 py-3 text-lg">
                            쇼핑하러 가기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
