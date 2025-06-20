
export class DemoStorageService {
  static handleDemoModeUpload(file: File, finalPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('Demo mode: Converting file to persistent base64 storage');
      
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const base64Data = reader.result as string;
          const demoUrl = `demo://${finalPath}`;
          
          // Store file persistently as base64 in localStorage
          const persistentFiles = JSON.parse(localStorage.getItem('demo-persistent-files') || '{}');
          persistentFiles[finalPath] = {
            data: base64Data,
            type: file.type,
            name: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            url: demoUrl
          };
          
          localStorage.setItem('demo-persistent-files', JSON.stringify(persistentFiles));
          
          // Also update the old demo-uploaded-files for backward compatibility
          const demoFiles = JSON.parse(localStorage.getItem('demo-uploaded-files') || '[]');
          const existingFileIndex = demoFiles.findIndex((f: any) => f.path === finalPath);
          
          const fileInfo = {
            path: finalPath,
            url: demoUrl,
            data: base64Data, // Store base64 data directly
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            size: file.size,
            type: file.type
          };
          
          if (existingFileIndex >= 0) {
            demoFiles[existingFileIndex] = fileInfo;
          } else {
            demoFiles.push(fileInfo);
          }
          
          localStorage.setItem('demo-uploaded-files', JSON.stringify(demoFiles));
          
          console.log('Demo file stored persistently:', demoUrl);
          resolve(demoUrl);
        } catch (storageError) {
          reject(new Error('Failed to process file for demo storage'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file for demo storage'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  static deleteDemoFile(path: string) {
    // Remove from both storage locations
    const uploadedFiles = JSON.parse(localStorage.getItem('demo-uploaded-files') || '[]');
    const updatedFiles = uploadedFiles.filter((file: any) => file.path !== path);
    localStorage.setItem('demo-uploaded-files', JSON.stringify(updatedFiles));
    
    // Also remove from persistent storage
    const persistentFiles = JSON.parse(localStorage.getItem('demo-persistent-files') || '{}');
    delete persistentFiles[path];
    localStorage.setItem('demo-persistent-files', JSON.stringify(persistentFiles));
  }

  static demoFileExists(path: string): boolean {
    // Check persistent demo storage first
    const persistentFiles = JSON.parse(localStorage.getItem('demo-persistent-files') || '{}');
    if (persistentFiles[path]) {
      return true;
    }
    
    // Check demo mode files
    const demoFiles = JSON.parse(localStorage.getItem('demo-uploaded-files') || '[]');
    return demoFiles.some((file: any) => file.path === path);
  }

  static getDemoFileData(path: string): string | null {
    // Extract the path and find the file data
    const demoPath = path.replace('demo://', '');
    
    // Try persistent storage first
    const persistentFiles = JSON.parse(localStorage.getItem('demo-persistent-files') || '{}');
    if (persistentFiles[demoPath]) {
      console.log('Using persistent demo file:', demoPath);
      return persistentFiles[demoPath].data; // Return base64 data directly
    }
    
    // Fall back to old storage method
    const demoFiles = JSON.parse(localStorage.getItem('demo-uploaded-files') || '[]');
    const demoFile = demoFiles.find((file: any) => file.path === demoPath);
    
    if (demoFile && demoFile.data) {
      console.log('Using demo file data for:', demoPath);
      return demoFile.data; // Return base64 data directly
    }
    
    // Final fallback for old blob URLs (may not work after page refresh)
    if (demoFile && demoFile.blobUrl) {
      console.log('Using demo blob URL (may be temporary):', demoFile.blobUrl);
      return demoFile.blobUrl;
    }
    
    return null;
  }
}
