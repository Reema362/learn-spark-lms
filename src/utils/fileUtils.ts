
export const sanitizeFileName = (fileName: string): string => {
  // Get file extension
  const lastDotIndex = fileName.lastIndexOf('.');
  const name = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
  const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
  
  // Sanitize the filename - remove special characters and replace spaces
  const sanitizedName = name
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
  
  return sanitizedName + extension;
};

export const generateUniqueFileName = (originalName: string): string => {
  const sanitized = sanitizeFileName(originalName);
  const timestamp = Date.now();
  const lastDotIndex = sanitized.lastIndexOf('.');
  
  if (lastDotIndex > 0) {
    const name = sanitized.substring(0, lastDotIndex);
    const extension = sanitized.substring(lastDotIndex);
    return `${timestamp}_${name}${extension}`;
  }
  
  return `${timestamp}_${sanitized}`;
};
