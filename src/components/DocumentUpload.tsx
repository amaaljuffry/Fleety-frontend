import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  X, 
  Loader2, 
  Download, 
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, getAuthToken } from '@/api/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Document {
  id: string;
  vehicle_id: string;
  document_type: string;
  title: string;
  description?: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

interface DocumentUploadProps {
  vehicleId: string;
}

const DOCUMENT_TYPES = [
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'registration', label: 'Registration', icon: '📋' },
  { value: 'inspection', label: 'Inspection Certificate', icon: '✅' },
  { value: 'service_receipt', label: 'Service Receipt', icon: '🧾' },
  { value: 'other', label: 'Other', icon: '📄' },
];

const getDocumentTypeInfo = (type: string) => {
  return DOCUMENT_TYPES.find(t => t.value === type) || DOCUMENT_TYPES[4];
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const isExpiringSoon = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
};

const isExpired = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
};

const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return <FileText className="h-8 w-8 text-gray-400" />;
  if (mimeType.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
  if (mimeType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
  return <File className="h-8 w-8 text-gray-500" />;
};

export function DocumentUpload({ vehicleId }: DocumentUploadProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    document_type: 'other',
    description: '',
    expiry_date: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  // Fetch documents for this vehicle
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/api/documents/vehicle/${vehicleId}`, { method: 'GET' });
      const data = response?.data || response || [];
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    if (vehicleId) {
      fetchDocuments();
    }
  }, [vehicleId, fetchDocuments]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setUploadForm(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for title
      }));
      setShowUploadDialog(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document_type', uploadForm.document_type);
      formData.append('title', uploadForm.title || selectedFile.name);
      if (uploadForm.description) {
        formData.append('description', uploadForm.description);
      }
      if (uploadForm.expiry_date) {
        formData.append('expiry_date', uploadForm.expiry_date);
      }

      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/documents/vehicle/${vehicleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      toast({
        title: 'Document uploaded',
        description: 'Your document has been uploaded successfully.',
      });

      setShowUploadDialog(false);
      setSelectedFile(null);
      setUploadForm({
        title: '',
        document_type: 'other',
        description: '',
        expiry_date: '',
      });
      fetchDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      await apiRequest(`/api/documents/${documentToDelete.id}`, { method: 'DELETE' });
      
      toast({
        title: 'Document deleted',
        description: 'The document has been deleted successfully.',
      });
      
      fetchDocuments();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete the document.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleDownload = (doc: Document) => {
    const token = getAuthToken();
    const downloadUrl = `${API_URL}${doc.file_url}`;
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = doc.file_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (doc: Document) => {
    if (doc.mime_type?.startsWith('image/') || doc.mime_type === 'application/pdf') {
      setPreviewDocument(doc);
    } else {
      handleDownload(doc);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop the file here...</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium mb-1">
              Drag & drop a document here, or click to select
            </p>
            <p className="text-sm text-gray-400">
              PDF, Images, Word, Excel (max 10MB)
            </p>
          </>
        )}
      </div>

      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const typeInfo = getDocumentTypeInfo(doc.document_type);
            const expired = isExpired(doc.expiry_date);
            const expiringSoon = isExpiringSoon(doc.expiry_date);

            return (
              <Card key={doc.id} className={`relative ${expired ? 'border-red-200 bg-red-50' : expiringSoon ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      {getFileIcon(doc.mime_type)}
                    </div>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-gray-900 truncate" title={doc.title}>
                            {doc.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {typeInfo.icon} {typeInfo.label}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {formatFileSize(doc.file_size)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expiry Status */}
                      {doc.expiry_date && (
                        <div className={`flex items-center gap-1 mt-2 text-xs ${expired ? 'text-red-600' : expiringSoon ? 'text-yellow-600' : 'text-gray-500'}`}>
                          {expired ? (
                            <>
                              <AlertCircle className="h-3 w-3" />
                              Expired on {formatDate(doc.expiry_date)}
                            </>
                          ) : expiringSoon ? (
                            <>
                              <AlertCircle className="h-3 w-3" />
                              Expires {formatDate(doc.expiry_date)}
                            </>
                          ) : (
                            <>
                              <Calendar className="h-3 w-3" />
                              Expires {formatDate(doc.expiry_date)}
                            </>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      {doc.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{doc.description}</p>
                      )}

                      {/* Upload Date */}
                      <p className="text-xs text-gray-400 mt-2">
                        Uploaded {formatDate(doc.created_at)}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(doc)}
                          className="h-7 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          className="h-7 text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDocumentToDelete(doc);
                            setDeleteDialogOpen(true);
                          }}
                          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">No documents yet</p>
          <p className="text-sm">Upload insurance, registration, or other vehicle documents</p>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add details about the document you're uploading.
            </DialogDescription>
          </DialogHeader>

          {selectedFile && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getFileIcon(selectedFile.type)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setShowUploadDialog(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Document title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_type">Document Type</Label>
              <Select
                value={uploadForm.document_type}
                onValueChange={(value) => setUploadForm(prev => ({ ...prev, document_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date (optional)</Label>
              <Input
                id="expiry_date"
                type="date"
                value={uploadForm.expiry_date}
                onChange={(e) => setUploadForm(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add a description..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewDocument?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewDocument?.mime_type?.startsWith('image/') ? (
              <img
                src={`${API_URL}${previewDocument.file_url}`}
                alt={previewDocument.title}
                className="max-w-full h-auto mx-auto"
              />
            ) : previewDocument?.mime_type === 'application/pdf' ? (
              <iframe
                src={`${API_URL}${previewDocument.file_url}`}
                className="w-full h-[70vh]"
                title={previewDocument.title}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DocumentUpload;
