import imageCompression from 'browser-image-compression';

// Compression options based on file size
const getCompressionOptions = (fileSize) => {
  const fileSizeMB = fileSize / (1024 * 1024);
  
  if (fileSizeMB > 50) {
    // Very large files - aggressive compression
    return {
      maxSizeMB: 3, // Maximum 3MB output
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.6,
    };
  } else if (fileSizeMB > 20) {
    // Large files - moderate compression
    return {
      maxSizeMB: 5, // Maximum 5MB output
      maxWidthOrHeight: 2048,
      useWebWorker: true,
      initialQuality: 0.7,
    };
  } else if (fileSizeMB > 10) {
    // Medium files - light compression
    return {
      maxSizeMB: 8, // Maximum 8MB output
      maxWidthOrHeight: 2560,
      useWebWorker: true,
      initialQuality: 0.8,
    };
  } else {
    // Small files - minimal compression if needed
    return {
      maxSizeMB: fileSizeMB > 4 ? 4 : fileSizeMB, // Only compress if over 4MB
      maxWidthOrHeight: 3840, // 4K resolution
      useWebWorker: true,
      initialQuality: 0.9,
    };
  }
};

// Video compression function (basic)
const compressVideo = async (file, onProgress) => {
  // For videos over 50MB, we'll just return the original
  // as video compression is complex and requires specialized libraries
  const fileSizeMB = file.size / (1024 * 1024);
  
  if (fileSizeMB > 50) {
    throw new Error(`Video file is ${fileSizeMB.toFixed(1)}MB. Please compress the video to under 50MB using a video editing app before uploading.`);
  }
  
  // For smaller videos, return as-is
  return file;
};

// Main compression function
export const compressFile = async (file, onProgress = () => {}) => {
  const originalSizeMB = (file.size / (1024 * 1024)).toFixed(1);
  
  try {
    onProgress(10, `Analyzing ${file.name} (${originalSizeMB}MB)...`);
    
    if (file.type.startsWith('video/')) {
      onProgress(50, 'Processing video...');
      const compressedFile = await compressVideo(file, onProgress);
      onProgress(100, 'Video ready for upload');
      return compressedFile;
    }
    
    if (file.type.startsWith('image/')) {
      onProgress(20, 'Compressing image...');
      
      const options = getCompressionOptions(file.size);
      
      const compressedFile = await imageCompression(file, {
        ...options,
        onProgress: (progress) => {
          // Map compression progress to our overall progress (20-90%)
          const mappedProgress = 20 + (progress * 0.7);
          onProgress(mappedProgress, `Compressing image... ${Math.round(progress)}%`);
        },
      });
      
      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(1);
      const savings = (((file.size - compressedFile.size) / file.size) * 100).toFixed(0);
      
      onProgress(100, `Compressed: ${originalSizeMB}MB → ${compressedSizeMB}MB (${savings}% smaller)`);
      
      // If compression didn't help much and file is still large, warn user
      if (compressedFile.size > 4 * 1024 * 1024) { // Still over 4MB
        console.warn(`File ${file.name} is still ${compressedSizeMB}MB after compression`);
      }
      
      return compressedFile;
    }
    
    // For other file types, return as-is
    onProgress(100, 'File ready for upload');
    return file;
    
  } catch (error) {
    console.error('Compression error:', error);
    
    // If compression fails, return original file with warning
    if (file.size > 4 * 1024 * 1024) {
      throw new Error(`File compression failed and original file (${originalSizeMB}MB) is too large. Please try a smaller file.`);
    }
    
    onProgress(100, 'Using original file');
    return file;
  }
};

// Batch compression for multiple files
export const compressFiles = async (files, onProgress = () => {}) => {
  const compressedFiles = [];
  const totalFiles = files.length;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileProgress = (i / totalFiles) * 100;
    
    onProgress(fileProgress, `Processing file ${i + 1} of ${totalFiles}: ${file.name}`);
    
    try {
      const compressedFile = await compressFile(file, (progress, message) => {
        // Scale individual file progress within the overall progress
        const scaledProgress = fileProgress + (progress / totalFiles);
        onProgress(scaledProgress, message);
      });
      
      compressedFiles.push(compressedFile);
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
      throw new Error(`Failed to process ${file.name}: ${error.message}`);
    }
  }
  
  onProgress(100, 'All files processed successfully!');
  return compressedFiles;
};

// Utility to check if compression is recommended
export const shouldCompress = (file) => {
  const sizeMB = file.size / (1024 * 1024);
  
  // Compress images over 2MB or videos over 10MB
  if (file.type.startsWith('image/') && sizeMB > 2) {
    return true;
  }
  if (file.type.startsWith('video/') && sizeMB > 10) {
    return true;
  }
  
  return false;
};
