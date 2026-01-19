
import React from 'react';

interface AvatarProps {
    src?: string;
    name: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className = '' }) => {
    const sizeClasses = {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
    };

    // Check if className already contains width or height classes
    const hasWidth = className.includes('w-');
    const hasHeight = className.includes('h-');
    const appliedSizeClasses = (hasWidth && hasHeight) ? '' : sizeClasses[size];

    // Check for rounding classes
    const hasRounding = className.includes('rounded-');
    const appliedRounding = hasRounding ? '' : 'rounded-xl';

    const initials = name
        .trim()
        .split(/\s+/)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const [imgError, setImgError] = React.useState(false);

    // If src is provided and no error, show image
    if (src && !imgError) {
        return (
            <img
                src={src}
                alt={name}
                className={`${appliedSizeClasses} ${appliedRounding} object-cover ring-1 ring-white/10 ${className}`}
                onError={() => setImgError(true)}
            />
        );
    }

    // Fallback: Initials with a nice gradient
    return (
        <div className={`${appliedSizeClasses} ${appliedRounding} bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 select-none ${className}`}>
            {initials || '?'}
        </div>
    );
};

export default Avatar;
