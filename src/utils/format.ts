/**
 * 상품명 포맷팅 관련 유틸리티 (백엔드 더미 데이터용 쓰레기 문자열 제거)
 */
export const cleanProductName = (name?: string): string => {
    if (!name) return '';
    // 예: "프리미엄 도드람 돼지고기 602g (상품 번호 : 140)" -> "프리미엄 도드람 돼지고기 602g"
    return name.replace(/\s*\(\s*상품\s*번호\s*:\s*\d+\s*\)/gi, '').trim();
};
