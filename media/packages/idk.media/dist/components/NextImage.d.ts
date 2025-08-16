import React from 'react';
import type { ImageProps as NextImageProps } from 'next/image';
export interface IDKImageProps extends Omit<NextImageProps, 'src' | 'onError'> {
    id: string;
    variant?: string;
    analytics?: boolean;
    onError?: (error: Error) => void;
}
export declare const IDKImage: React.FC<IDKImageProps>;
