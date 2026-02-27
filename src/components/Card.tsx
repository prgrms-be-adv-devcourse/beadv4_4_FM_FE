import React from 'react';

interface CardProps {
    className?: string;
    children: React.ReactNode;
    hoverEffect?: boolean;
    onClick?: () => void;
}

export const Card = ({ className = '', children, hoverEffect = false, onClick }: CardProps) => {
    return (
        <div
            onClick={onClick}
            className={`
                bg-surface-color 
                rounded-2xl 
                border border-border-color 
                shadow-sm 
                p-8 
                ${hoverEffect ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-border-color/80 cursor-pointer' : ''} 
                ${className}
            `}
        >
            {children}
        </div>
    );
};
