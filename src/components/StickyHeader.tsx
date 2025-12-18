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
                "sticky top-0 z-30 pt-4 pb-4 bg-background/80 backdrop-blur-sm border-b border-border/50", // Added backdrop-blur
                className
            )}
        >
            {children}
        </header>
    );
};

export default StickyHeader;