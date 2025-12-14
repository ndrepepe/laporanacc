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
                "sticky top-0 z-10 py-4 mb-6 bg-background/90 backdrop-blur-sm border-b border-border/50",
                className
            )}
        >
            {children}
        </header>
    );
};

export default StickyHeader;