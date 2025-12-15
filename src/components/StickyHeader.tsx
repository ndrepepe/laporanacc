import React from 'react';
import { cn } from '@/lib/utils';

interface StickyHeaderProps {
    children: React.ReactNode;
    className?: string;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({ children, className }) => {
    return (
        <header 
            className={cn(
                "sticky top-0 z-30 pt-4 pb-4 bg-background/95 backdrop-blur-sm border-b border-border/50", // Menggunakan pt-4 pb-4 untuk padding internal
                className
            )}
        >
            {children}
        </header>
    );
};

export default StickyHeader;