import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  File,
  FileText,
  Image as ImageIcon,
  X,
  Loader2,
  Download,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  FolderOpen,
  UploadCloud,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  // External trigger counter: when changed, open upload dialog
  uploadTrigger?: number;
}

// Malaysian Vehicle Document Types
const DOCUMENT_TYPES = [
  { value: 'all', label: 'All Documents', icon: FolderOpen, color: 'bg-gray-100 text-gray-800', description: 'View all documents' },
  { value: 'road_tax', label: 'Road Tax', icon: Calendar, color: 'bg-blue-100 text-blue-800', description: 'Digital & physical road tax (LKM)' },
  { value: 'registration', label: 'Registration', icon: FileText, color: 'bg-purple-100 text-purple-800', description: 'Geran Kenderaan, ownership docs' },
  { value: 'insurance', label: 'Insurance', icon: AlertCircle, color: 'bg-green-100 text-green-800', description: 'Cover notes, policy documents' },
  { value: 'inspection', label: 'Inspection', icon: CheckCircle, color: 'bg-teal-100 text-teal-800', description: 'PUSPAKOM reports (B5, B7, B2)' },
  { value: 'service_records', label: 'Service Records', icon: FileText, color: 'bg-orange-100 text-orange-800', description: 'Maintenance receipts, logbooks' },
  { value: 'ownership', label: 'Ownership', icon: File, color: 'bg-indigo-100 text-indigo-800', description: 'Sales agreements, transfer forms' },
  { value: 'other', label: 'Other', icon: File, color: 'bg-gray-100 text-gray-800', description: 'Warranty, parking passes, etc' },
];

const getDocumentTypeInfo = (type: string) => {
  return DOCUMENT_TYPES.find(t => t.value === type) || DOCUMENT_TYPES[5];
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

const getFileIcon = (mimeType?: string, size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-10 w-10';
  
  if (!mimeType) return <FileText className={`${sizeClass} text-gray-400`} />;
  if (mimeType.startsWith('image/')) return <ImageIcon className={`${sizeClass} text-blue-500`} />;
  if (mimeType === 'application/pdf') return <FileText className={`${sizeClass} text-red-500`} />;
  return <File className={`${sizeClass} text-gray-500`} />;
};

export function DocumentUpload({ vehicleId, uploadTrigger }: DocumentUploadProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  // Auto-hide alert after 5 seconds
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setUploadForm(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ''),
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
    setUploadProgress(0);
    
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

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/documents/vehicle/${vehicleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      setShowAlert({ type: 'success', message: 'Document uploaded successfully!' });
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });

      await fetchDocuments();
      setShowUploadDialog(false);
      setSelectedFile(null);
      setUploadForm({
        title: '',
        document_type: 'other',
        description: '',
        expiry_date: '',
      });
    } catch (error) {
      console.error('Upload error:', error);
      setShowAlert({ type: 'error', message: 'Failed to upload document' });
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      await apiRequest(`/api/documents/${documentToDelete.id}`, { method: 'DELETE' });
      
      setShowAlert({ type: 'success', message: 'Document deleted successfully' });
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });

      await fetchDocuments();
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      setShowAlert({ type: 'error', message: 'Failed to delete document' });
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (doc: Document) => {
    window.open(doc.file_url, '_blank');
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return;
    
    try {
      await Promise.all(
        Array.from(selectedDocuments).map(id => 
          apiRequest(`/api/documents/${id}`, { method: 'DELETE' })
        )
      );
      
      setShowAlert({ type: 'success', message: `${selectedDocuments.size} documents deleted` });
      await fetchDocuments();
      setSelectedDocuments(new Set());
    } catch (error) {
      setShowAlert({ type: 'error', message: 'Failed to delete documents' });
    }
  };

  // Filter documents
  const filteredDocuments = documents
    .filter(doc => {
      // Tab filter
      if (activeTab !== 'all' && doc.document_type !== activeTab) return false;
      
      // Search filter
      if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.document_type.localeCompare(b.document_type);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Calculate storage usage
  const totalSize = documents.reduce((sum, doc) => sum + doc.file_size, 0);
  const maxSize = 100 * 1024 * 1024; // 100MB
  const storagePercent = (totalSize / maxSize) * 100;

  // Group documents by type
  const documentsByType = documents.reduce((acc, doc) => {
    if (!acc[doc.document_type]) {
      acc[doc.document_type] = [];
    }
    acc[doc.document_type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  // Open dialog when external trigger changes
  useEffect(() => {
    if (typeof uploadTrigger === 'number') {
      setShowUploadDialog(true);
    }
  }, [uploadTrigger]);

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      {showAlert && (
        <Alert variant={showAlert.type === 'success' ? 'default' : 'destructive'}>
          {showAlert.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{showAlert.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{showAlert.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Search & Filter Bar (moved inside content, optional) */}
          {documents.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by document name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'name' | 'type')}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="type">Sort by Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {loading ? (
            // Skeleton Loader
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            // Enhanced Empty State
            <div className="space-y-6">
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
                  ${isDragActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-lg scale-[1.02]' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50 dark:hover:bg-gray-900'
                  }
                `}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  <div className={`p-4 rounded-full transition-all ${isDragActive ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <UploadCloud className={`h-12 w-12 ${isDragActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      No documents uploaded yet
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get started by uploading your first vehicle document
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 pt-1">
                      {isDragActive ? 'Drop the file here!' : 'Drag & drop or click to browse'}
                    </p>
                  </div>
                  {/* Removed internal upload button to avoid duplication; drag area itself is interactive */}
                  <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
                    <Badge variant="secondary" className="text-xs">PDF</Badge>
                    <Badge variant="secondary" className="text-xs">JPG/PNG</Badge>
                    <Badge variant="secondary" className="text-xs">Word</Badge>
                    <Badge variant="secondary" className="text-xs">Excel</Badge>
                    <Badge variant="outline" className="text-xs">Max 10MB</Badge>
                  </div>
                </div>
              </div>

              {/* Document Type Guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                <div className="text-sm">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Common Malaysian Documents:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-blue-600" />
                      Road Tax (LKM)
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="h-3 w-3 text-purple-600" />
                      Geran Kenderaan (Vehicle Grant)
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-green-600" />
                      Insurance Policy
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-teal-600" />
                      PUSPAKOM Report
                    </li>
                  </ul>
                </div>
                <div className="text-sm">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Additional Documents:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <FileText className="h-3 w-3 text-orange-600" />
                      Service Records
                    </li>
                    <li className="flex items-center gap-2">
                      <File className="h-3 w-3 text-indigo-600" />
                      Ownership Transfer
                    </li>
                    <li className="flex items-center gap-2">
                      <File className="h-3 w-3 text-gray-600" />
                      Warranty Cards
                    </li>
                    <li className="flex items-center gap-2">
                      <File className="h-3 w-3 text-gray-600" />
                      Parking Passes
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            // Document List with Tabs
            <div className="space-y-4">

              {/* Bulk Actions */}
              {selectedDocuments.size > 0 && (
                <Alert>
                  <CheckSquare className="h-4 w-4" />
                  <AlertTitle>
                    {selectedDocuments.size} document{selectedDocuments.size > 1 ? 's' : ''} selected
                  </AlertTitle>
                  <AlertDescription className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete Selected
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedDocuments(new Set())}
                    >
                      Clear Selection
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Tabs for Malaysian Document Types */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="w-full overflow-x-auto">
                  <TabsList className="inline-flex w-full min-w-max">
                    {DOCUMENT_TYPES.map(type => {
                      const TypeIcon = type.icon;
                      const count = type.value === 'all' 
                        ? documents.length 
                        : documents.filter(d => d.document_type === type.value).length;
                      
                      return (
                        <TooltipProvider key={type.value}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <TabsTrigger value={type.value} className="gap-1.5 min-w-fit">
                                <TypeIcon className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">{type.label}</span>
                                <span className="sm:hidden">{type.label.split(' ')[0]}</span>
                                {count > 0 && (
                                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center">
                                    {count}
                                  </Badge>
                                )}
                              </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">{type.label}</p>
                              <p className="text-xs text-muted-foreground">{type.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </TabsList>
                </div>

                <TabsContent value={activeTab} className="mt-4 space-y-3">
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">No documents found in this category</p>
                      <p className="text-sm mt-1">
                        {activeTab === 'all' ? 'Upload your first document to get started' : `No ${DOCUMENT_TYPES.find(t => t.value === activeTab)?.label.toLowerCase()} uploaded yet`}
                      </p>
                      <Button 
                        onClick={() => setShowUploadDialog(true)}
                        variant="outline" 
                        className="mt-4"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  ) : (
                    filteredDocuments.map(doc => {
                      const typeInfo = getDocumentTypeInfo(doc.document_type);
                      const TypeIcon = typeInfo.icon;
                      const isSelected = selectedDocuments.has(doc.id);
                      
                      return (
                        <Card key={doc.id} className={`transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Checkbox */}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => toggleDocumentSelection(doc.id)}
                                      className="mt-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1"
                                    >
                                      {isSelected ? (
                                        <CheckSquare className="h-5 w-5 text-blue-600" />
                                      ) : (
                                        <Square className="h-5 w-5 text-gray-400" />
                                      )}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Select document</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {/* File Icon */}
                              <div className="flex-shrink-0">
                                {getFileIcon(doc.mime_type, 'lg')}
                              </div>

                              {/* Document Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                      {doc.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 truncate">{doc.file_name}</p>
                                  </div>
                                  <Badge variant="secondary" className={typeInfo.color}>
                                    <TypeIcon className="h-3 w-3 mr-1" />
                                    {typeInfo.label}
                                  </Badge>
                                </div>

                                {doc.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                    {doc.description}
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(doc.created_at)}
                                  </span>
                                  <span>{formatFileSize(doc.file_size)}</span>
                                  {doc.expiry_date && (
                                    <Badge 
                                      variant={isExpired(doc.expiry_date) ? 'destructive' : isExpiringSoon(doc.expiry_date) ? 'outline' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {isExpired(doc.expiry_date) ? '❌ Expired' : isExpiringSoon(doc.expiry_date) ? '⚠️ Expiring Soon' : '✓ Valid'}
                                      {' '}{formatDate(doc.expiry_date)}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Actions Menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => setPreviewDocument(doc)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setDocumentToDelete(doc);
                                      setDeleteDialogOpen(true);
                                    }}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>

        {documents.length > 0 && (
          <CardFooter className="flex-col gap-3 border-t pt-4">
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Storage Used</span>
                <span className="font-medium">
                  {formatFileSize(totalSize)} / {formatFileSize(maxSize)}
                </span>
              </div>
              <Progress value={storagePercent} className="h-2" />
            </div>
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setShowUploadDialog(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload More
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a new document for this vehicle
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedFile && (
              <Alert>
                <File className="h-4 w-4" />
                <AlertTitle>Selected File</AlertTitle>
                <AlertDescription>
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </AlertDescription>
              </Alert>
            )}

            {!selectedFile && (
              <div
                {...getRootProps()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click or drag file here</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Document title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Document Type *</Label>
              <Select
                value={uploadForm.document_type}
                onValueChange={(value) => setUploadForm(prev => ({ ...prev, document_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.slice(1).map(type => {
                    const TypeIcon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date (Optional)</Label>
              <Input
                id="expiry"
                type="date"
                value={uploadForm.expiry_date}
                onChange={(e) => setUploadForm(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUploadDialog(false);
                setSelectedFile(null);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || !uploadForm.title || uploading}
            >
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
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Document
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{documentToDelete?.title}</strong>?
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      {previewDocument && (
        <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{previewDocument.title}</DialogTitle>
              <DialogDescription>{previewDocument.file_name}</DialogDescription>
            </DialogHeader>
            <div className="w-full h-[70vh] overflow-auto">
              {previewDocument.mime_type?.startsWith('image/') ? (
                <img 
                  src={previewDocument.file_url} 
                  alt={previewDocument.title}
                  className="w-full h-auto"
                />
              ) : previewDocument.mime_type === 'application/pdf' ? (
                <iframe
                  src={previewDocument.file_url}
                  className="w-full h-full border-0"
                  title={previewDocument.title}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FileText className="h-16 w-16 mb-4" />
                  <p>Preview not available for this file type</p>
                  <Button 
                    onClick={() => handleDownload(previewDocument)}
                    className="mt-4"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
