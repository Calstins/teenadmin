// components/ui/cloudinary-upload-widget.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

declare global {
    interface Window {
        cloudinary: any;
    }
}

interface CloudinaryUploadWidgetProps {
    onUpload: (url: string) => void;
    currentImageUrl?: string;
    buttonText?: string;
    buttonVariant?: 'default' | 'outline' | 'ghost';
    folder?: string;
}

export function CloudinaryUploadWidget({
    onUpload,
    currentImageUrl,
    buttonText = 'Upload Image',
    buttonVariant = 'outline',
    folder = 'teenshapers',
}: CloudinaryUploadWidgetProps) {
    const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
    const [isUploading, setIsUploading] = useState(false);
    const widgetRef = useRef<any>(null);

    useEffect(() => {
        setImageUrl(currentImageUrl || '');
    }, [currentImageUrl]);

    useEffect(() => {
        // Load Cloudinary script
        if (!window.cloudinary) {
            const script = document.createElement('script');
            script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const openWidget = () => {
        if (!window.cloudinary) {
            alert('Cloudinary widget is still loading. Please try again.');
            return;
        }

        if (!widgetRef.current) {
            widgetRef.current = window.cloudinary.createUploadWidget(
                {
                    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
                    folder: folder,
                    sources: ['local', 'url', 'camera'],
                    maxFiles: 1,
                    maxFileSize: 5000000, // 5MB
                    clientAllowedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
                    cropping: true,
                    croppingAspectRatio: 1,
                    croppingShowDimensions: true,
                    showSkipCropButton: false,
                    croppingCoordinatesMode: 'custom',
                },
                (error: any, result: any) => {
                    if (error) {
                        console.error('Upload error:', error);
                        setIsUploading(false);
                        return;
                    }

                    if (result.event === 'success') {
                        const url = result.info.secure_url;
                        setImageUrl(url);
                        onUpload(url);
                        setIsUploading(false);
                    }

                    if (result.event === 'close') {
                        setIsUploading(false);
                    }
                }
            );
        }

        setIsUploading(true);
        widgetRef.current.open();
    };

    const removeImage = () => {
        setImageUrl('');
        onUpload('');
    };

    return (
        <div className="space-y-2">
            {imageUrl ? (
                <div className="relative">
                    <div className="relative w-full h-48 rounded-lg border overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <img
                            src={imageUrl}
                            alt="Uploaded"
                            className="w-full h-full object-cover"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={openWidget}
                        disabled={isUploading}
                        className="w-full mt-2"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Change Image
                    </Button>
                </div>
            ) : (
                <Button
                    type="button"
                    variant={buttonVariant}
                    onClick={openWidget}
                    disabled={isUploading}
                    className="w-full"
                >
                    {isUploading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            {buttonText}
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}