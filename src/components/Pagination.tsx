import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 0) return null;

    // 최대 5개 페이지 번호 표시
    const maxVisible = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(0, endPage - maxVisible + 1);
    }

    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    const btnBase: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '34px',
        height: '34px',
        padding: '0 0.4rem',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        backgroundColor: '#ffffff',
        color: '#374151',
        fontSize: '0.85rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
    };

    const btnDisabled: React.CSSProperties = {
        ...btnBase,
        backgroundColor: '#f3f4f6',
        color: '#c4c8cc',
        cursor: 'not-allowed',
        borderColor: '#e5e7eb',
    };

    const btnActive: React.CSSProperties = {
        ...btnBase,
        backgroundColor: '#3B5240',
        color: '#ffffff',
        borderColor: '#3B5240',
        fontWeight: 700,
    };

    const isFirst = currentPage === 0;
    const isLast = currentPage >= totalPages - 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                {/* 처음 */}
                <button onClick={() => onPageChange(0)} disabled={isFirst} style={isFirst ? btnDisabled : btnBase} title="처음">
                    «
                </button>

                {/* 이전 */}
                <button onClick={() => onPageChange(currentPage - 1)} disabled={isFirst} style={isFirst ? btnDisabled : btnBase} title="이전">
                    ‹
                </button>

                {/* ... 앞 생략 */}
                {startPage > 0 && (
                    <span style={{ padding: '0 0.2rem', color: '#9ca3af', fontSize: '0.8rem', userSelect: 'none' }}>…</span>
                )}

                {/* 페이지 번호 */}
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        style={page === currentPage ? btnActive : btnBase}
                        onMouseEnter={(e) => {
                            if (page !== currentPage) {
                                e.currentTarget.style.backgroundColor = '#f0fdf4';
                                e.currentTarget.style.borderColor = '#3B5240';
                                e.currentTarget.style.color = '#3B5240';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (page !== currentPage) {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.borderColor = '#d1d5db';
                                e.currentTarget.style.color = '#374151';
                            }
                        }}
                    >
                        {page + 1}
                    </button>
                ))}

                {/* ... 뒤 생략 */}
                {endPage < totalPages - 1 && (
                    <span style={{ padding: '0 0.2rem', color: '#9ca3af', fontSize: '0.8rem', userSelect: 'none' }}>…</span>
                )}

                {/* 다음 */}
                <button onClick={() => onPageChange(currentPage + 1)} disabled={isLast} style={isLast ? btnDisabled : btnBase} title="다음">
                    ›
                </button>

                {/* 끝 */}
                <button onClick={() => onPageChange(totalPages - 1)} disabled={isLast} style={isLast ? btnDisabled : btnBase} title="마지막">
                    »
                </button>
            </div>

            {/* 페이지 정보 */}
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {currentPage + 1} / {totalPages} 페이지
            </span>
        </div>
    );
};

export default Pagination;
