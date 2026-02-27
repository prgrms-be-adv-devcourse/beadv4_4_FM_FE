import { Link } from 'react-router-dom';
import { FaCommentDots } from 'react-icons/fa';
import type { ProductResponse } from '../api/market';
import { cleanProductName } from '../utils/format';

import React from 'react'; // 상단에 없다면 추가

interface ProductCardProps {
    product: ProductResponse;
    onAddToCart?: (e: React.MouseEvent, productId: number) => void;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    // Extended Interface for UI Demo (Badges)
    // In a real app, these would come from the backend `product.badges`
    const isEco = product.id % 2 === 0; // Mock logic
    const discount = product.id % 5 === 0 ? 10 + (product.id % 3) * 5 : 0; // Mock logic
    const mockReviews = 152 + (product.id * 17) % 800; // Mock logic 
    const isMemberDeal = product.id % 7 === 0;

    return (
        <div className="group block bg-white w-full max-w-[250px] flex flex-col relative transition-all duration-300">
            <Link to={`/market/${product.id}`} className="block relative aspect-[4/5] bg-[#F9F9F7] overflow-hidden rounded-[8px] mb-2">
                {product.thumbnail ? (
                    <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                ) : null}

                {/* Fallback Image */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-[#F9F9F7] ${product.thumbnail ? 'hidden' : ''}`}>
                    <span className="text-xs font-medium uppercase tracking-widest opacity-40">No Image</span>
                </div>

                {/* Top Left Badges (Festa Deal, Member) */}
                <div className="absolute top-0 left-0 flex flex-col gap-1">
                    {isMemberDeal && (
                        <span className="bg-[#42C8D2] px-2 py-1 text-[11px] font-bold text-white shadow-sm inline-block rounded-br-md">
                            멤버스특가
                        </span>
                    )}
                    {discount > 0 && !isMemberDeal && (
                        <span className="bg-[#B964FF] px-2 py-[6px] text-[12px] font-bold text-white shadow-sm inline-block">
                            {discount}% 쿠폰
                        </span>
                    )}
                </div>

                {/* FESTA DEAL Bottom Left Badge */}
                {isEco && (
                    <div className="absolute bottom-2 left-2">
                        <span className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-[11px] font-bold text-slate-700 shadow-sm">
                            FESTA DEAL
                        </span>
                    </div>
                )}
            </Link>

            {/* Content Area */}
            <Link to={`/market/${product.id}`} className="flex flex-col flex-1 px-1 block">
                {/* Brand Name */}
                {product.brand && (
                    <div className="text-[13px] text-slate-500 mb-1">
                        [{product.brand}]
                    </div>
                )}

                {/* Product Name */}
                <h3 className="text-[15px] font-normal text-[#333] leading-snug line-clamp-2 mb-2 group-hover:underline decoration-slate-400 underline-offset-2">
                    {cleanProductName(product.name)}
                </h3>

                {/* Price Area */}
                <div className="flex flex-col mb-2">
                    {discount > 0 && (
                        <span className="text-[13px] text-slate-400 line-through mb-[2px]">
                            {Math.round(product.minPrice * (1 + discount / 100)).toLocaleString()}원
                        </span>
                    )}
                    <div className="flex items-end gap-[6px]">
                        {discount > 0 && (
                            <span className="text-[16px] font-bold text-[#FA622F]">
                                {discount}%
                            </span>
                        )}
                        <span className="text-[16px] font-bold text-[#333]">
                            {product.minPrice?.toLocaleString() || 0}원~
                        </span>
                    </div>
                </div>

                {/* Review Count (Bottom) */}
                <div className="mt-auto flex items-center gap-1 text-[12px] text-[#999]">
                    <FaCommentDots className="text-[11px]" />
                    <span>{mockReviews > 999 ? '999+' : mockReviews}</span>
                </div>
            </Link>
        </div>
    );
};
