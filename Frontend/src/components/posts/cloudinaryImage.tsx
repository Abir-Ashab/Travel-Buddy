import React from 'react';

interface CloudinaryImageProps {
  imageUrl: string;
  alt?: string;
  className?: string;
}

const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  imageUrl,
  alt = 'Cloudinary Image',
  className = '',
}) => {
  return (
    <div className={`overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
      />
    </div>
  );
};

export default CloudinaryImage;
