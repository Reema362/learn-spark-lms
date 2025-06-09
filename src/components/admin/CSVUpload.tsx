
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DatabaseService } from '@/services/database';
import { useQueryClient } from '@tanstack/react-query';

interface CSVUser {
  email: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  role?: 'admin' | 'user';
}

const CSVUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const parseCSV = (text: string): CSVUser[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    console.log('CSV Headers:', headers);
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',');
      const user: CSVUser = { email: '' };
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/"/g, ''); // Remove quotes
        if (value) {
          switch (header) {
            case 'email':
              user.email = value;
              break;
            case 'first_name':
            case 'firstname':
            case 'first name':
              user.first_name = value;
              break;
            case 'last_name':
            case 'lastname':
            case 'last name':
              user.last_name = value;
              break;
            case 'department':
              user.department = value;
              break;
            case 'role':
              user.role = value.toLowerCase() === 'admin' ? 'admin' : 'user';
              break;
          }
        }
      });
      
      console.log(`Parsed user ${index + 1}:`, user);
      return user;
    }).filter(user => user.email && user.email.includes('@'));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setResults([]);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file",
        variant: "destructive"
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResults([]);
    
    try {
      console.log('Starting CSV upload process...');
      const text = await file.text();
      console.log('CSV file content:', text.substring(0, 200) + '...');
      
      const users = parseCSV(text);
      console.log('Parsed users:', users);
      
      if (users.length === 0) {
        toast({
          title: "No Valid Users Found",
          description: "The CSV file doesn't contain valid user data with email addresses",
          variant: "destructive"
        });
        return;
      }

      console.log(`Processing ${users.length} users...`);
      
      // Show progress toast
      toast({
        title: "Processing Users",
        description: `Starting upload of ${users.length} users...`,
      });
      
      const uploadResults = await DatabaseService.bulkCreateUsers(users);
      console.log('Upload results:', uploadResults);
      
      setResults(uploadResults);
      
      const successCount = uploadResults.filter(r => r.success).length;
      const errorCount = uploadResults.filter(r => !r.success).length;
      
      // Refresh the users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: "Upload Complete",
        description: `${successCount} users created successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default"
      });
      
    } catch (error: any) {
      console.error('CSV upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk User Upload
        </CardTitle>
        <CardDescription>
          Upload a CSV file to create multiple users at once. Required columns: email. Optional: first_name, last_name, department, role
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="flex-1"
            disabled={uploading}
          />
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="min-w-[120px]"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload CSV'
            )}
          </Button>
        </div>
        
        {file && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <h4 className="font-medium">Upload Results:</h4>
            <div className="text-sm text-muted-foreground mb-2">
              Success: {results.filter(r => r.success).length} | 
              Failed: {results.filter(r => !r.success).length}
            </div>
            {results.map((result, index) => (
              <div key={index} className="flex items-center gap-2 text-sm p-2 rounded border">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                )}
                <span className="flex-1">
                  {result.success 
                    ? `✓ ${result.email} - Temp password: ${result.tempPassword}`
                    : `✗ ${result.email} - ${result.error}`
                  }
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
          <strong>CSV Format Example:</strong><br />
          email,first_name,last_name,department,role<br />
          john.doe@company.com,John,Doe,IT,user<br />
          admin@company.com,Admin,User,IT,admin
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVUpload;
