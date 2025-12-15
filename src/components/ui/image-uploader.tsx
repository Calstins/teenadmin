// components/ui/ImageUploader.tsx - FIXED VERSION
'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Eye, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { uploadAPI } from '@/lib/api';

interface ImageUploaderProps {
    images?: string[];
    onImagesChange: (images: string[]) => void;
    multiple?: boolean;
    maxImages?: number;
    className?: string;
    folder?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    images = [],
    onImagesChange,
    multiple = false,
    maxImages = 5,
    className = '',
    folder = 'teenshapers',
}) => {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✅ FIXED: Prevent modal close on file select
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation(); // Stop event from bubbling up
        handleFileSelect(e.target.files);
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const maxAllowed = multiple ? maxImages - images.length : 1;
        const filesToProcess = fileArray.slice(0, maxAllowed);

        if (fileArray.length > maxAllowed) {
            toast.error(`Only ${maxAllowed} more image(s) can be uploaded`);
        }

        uploadImages(filesToProcess);
    };

    const uploadImages = async (files: File[]) => {
        setUploading(true);
        const uploadedImages: string[] = [];

        try {
            for (const file of files) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast.error(`${file.name} is not a valid image file`);
                    continue;
                }

                // Validate file size (10MB limit to match backend)
                if (file.size > 10 * 1024 * 1024) {
                    toast.error(`${file.name} is too large. Maximum size is 10MB`);
                    continue;
                }

                try {
                    const response = await uploadAPI.uploadImage(file, folder);

                    if (response.success && response.data?.secure_url) {
                        uploadedImages.push(response.data.secure_url);
                        console.log('✅ Image uploaded:', response.data.secure_url);
                    } else {
                        throw new Error(response.message || 'Upload failed');
                    }
                } catch (error: any) {
                    console.error('❌ Upload error:', error);
                    const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
                    toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
                }
            }

            if (uploadedImages.length > 0) {
                // ✅ For single image mode: Delete old image before adding new one
                if (!multiple && images.length > 0) {
                    // Delete the old image from Cloudinary (don't block on this)
                    const oldImageUrl = images[0];
                    removeImageFromCloud(oldImageUrl).catch(err =>
                        console.error('⚠️ Background deletion failed:', err)
                    );
                }

                const newImages = multiple
                    ? [...images, ...uploadedImages]
                    : uploadedImages;
                onImagesChange(newImages);
                toast.success(
                    `${uploadedImages.length} image(s) uploaded successfully!`
                );
            }
        } catch (error) {
            console.error('❌ Upload process error:', error);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    // ✅ FIXED: Improved public_id extraction with better error handling
    const extractPublicId = (imageUrl: string): string | null => {
        try {
            console.log('🔍 Extracting public_id from:', imageUrl);

            // Handle both full URLs and already-extracted public IDs
            if (!imageUrl.includes('cloudinary.com')) {
                console.log('⚠️ Not a Cloudinary URL:', imageUrl);
                return imageUrl; // Return as-is if not a Cloudinary URL
            }

            const url = new URL(imageUrl);
            const pathname = url.pathname;

            // Cloudinary URL structure: /image/upload/v1234567890/folder/filename.ext
            // or: /image/upload/folder/filename.ext
            // or: /raw/upload/v1234567890/folder/filename.pdf

            const uploadMatch = pathname.match(/\/(image|raw|video)\/upload\/(v\d+\/)?(.+)/);

            if (uploadMatch) {
                const pathAfterUpload = uploadMatch[3]; // Everything after upload/ or upload/v1234567890/

                // Remove file extension
                const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');

                console.log('✅ Extracted public_id:', publicId);
                return publicId;
            }

            // Fallback: Manual extraction
            const parts = pathname.split('/');
            const uploadIndex = parts.indexOf('upload');

            if (uploadIndex !== -1 && uploadIndex + 1 < parts.length) {
                let pathAfterUpload = parts.slice(uploadIndex + 1);

                // Skip version number if present
                if (pathAfterUpload[0] && /^v\d+$/.test(pathAfterUpload[0])) {
                    pathAfterUpload = pathAfterUpload.slice(1);
                }

                // Join and remove extension
                const publicId = pathAfterUpload.join('/').replace(/\.[^/.]+$/, '');
                console.log('✅ Extracted public_id (fallback):', publicId);
                return publicId;
            }

            console.error('❌ Could not extract public_id from URL structure');
            return null;
        } catch (error) {
            console.error('❌ Error extracting public_id:', error);
            return null;
        }
    };

    // ✅ Delete from cloud with better error handling
    const removeImageFromCloud = async (imageUrl: string): Promise<void> => {
        const publicId = extractPublicId(imageUrl);

        if (!publicId) {
            throw new Error('Could not extract public_id from URL');
        }

        console.log('🗑️ Deleting from Cloudinary:', publicId);

        try {
            const result = await uploadAPI.deleteFile(publicId);

            if (result.success) {
                console.log('✅ Cloudinary deletion successful');
            } else {
                console.error('❌ Cloudinary deletion failed:', result.message);
                throw new Error(result.message || 'Delete failed');
            }
        } catch (error: any) {
            console.error('❌ Delete API call failed:', error);
            throw error;
        }
    };

    // ✅ FIXED: Remove image with proper error handling
    const removeImage = async (e: React.MouseEvent, index: number, imageUrl: string) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('🗑️ Starting image removal:', imageUrl);

        // Optimistically remove from UI first for better UX
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);

        try {
            // Then delete from Cloudinary
            await removeImageFromCloud(imageUrl);
            toast.success('Image deleted successfully');
        } catch (error: any) {
            console.error('❌ Delete error:', error);
            console.error('Failed URL:', imageUrl);

            // Image already removed from UI, just show warning
            toast.warning('Image removed locally (cloud deletion may have failed)');
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    // ✅ FIXED: Prevent modal close when opening file dialog
    const openFileDialog = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        fileInputRef.current?.click();
    };

    const canAddMore = multiple ? images.length < maxImages : images.length === 0;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Upload Area */}
            {canAddMore && (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${dragActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={openFileDialog}
                >
                    {/* ✅ FIXED: Added stopPropagation to input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple={multiple}
                        accept="image/*"
                        onChange={handleFileChange}
                        onClick={(e) => e.stopPropagation()}
                        className="hidden"
                    />

                    <div className="space-y-2">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            {uploading ? (
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            ) : (
                                <Upload className="h-12 w-12" />
                            )}
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {uploading ? 'Uploading...' : images.length > 0 && !multiple ? 'Replace Image' : 'Upload Images'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Drag and drop or click to select{' '}
                                {multiple ? 'images' : 'an image'}
                            </p>
                            {multiple && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {images.length}/{maxImages} images uploaded
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Uploaded Images ({images.length})
                    </h4>
                    <div
                        className={`grid gap-4 ${multiple
                            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                            : 'grid-cols-1 max-w-xs'
                            }`}
                    >
                        {images.map((imageUrl, index) => (
                            <div
                                key={index}
                                className="relative group bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square"
                            >
                                <img
                                    src={imageUrl}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src =
                                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPg==';
                                    }}
                                />

                                {/* Overlay with actions */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                window.open(imageUrl, '_blank');
                                            }}
                                            className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                                            title="View full size"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        {!multiple && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openFileDialog();
                                                }}
                                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                                title="Replace image"
                                            >
                                                <Upload className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => removeImage(e, index, imageUrl)}
                                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                            title="Remove image"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Primary image indicator */}
                                {multiple && index === 0 && (
                                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                        Primary
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Add more button for multiple images */}
                        {multiple && canAddMore && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openFileDialog();
                                }}
                                className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                                disabled={uploading}
                            >
                                <Plus className="h-8 w-8 text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Guidelines */}
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>• Supported formats: JPG, PNG, GIF, WebP</p>
                <p>• Maximum file size: 10MB per image</p>
                {multiple && <p>• Maximum {maxImages} images allowed</p>}
                <p>• Recommended resolution: 512x512px for badges, 1200x800px for challenges</p>
                <p>• Images are automatically optimized for web</p>
            </div>
        </div>
    );
};

export default ImageUploader;