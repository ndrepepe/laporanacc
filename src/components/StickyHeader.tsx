import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface StickyHeaderProps {
    children: React.ReactNode;
    className?: string;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({ children, className }) => {
    const isMobile = useIsMobile();
    
    return (
        <header 
            className={cn(
                "sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                isMobile ? "py-2 mb-4" : "py-6 mb-6",
                className
            )}
        >
            {children}
        </header>
    );
};

export default StickyHeader;