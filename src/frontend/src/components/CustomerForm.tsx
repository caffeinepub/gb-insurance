import { useState } from 'react';
import { useSubmitForm } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ExternalBlob } from '../backend';
import { Loader2, Send, CheckCircle2, Upload, X, FileText, AlertCircle } from 'lucide-react';
import { getUserFriendlyErrorMessage } from '../utils/backendErrorMapping';

export default function CustomerForm() {
  const submitFormMutation = useSubmitForm();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    attachments: null as ExternalBlob | null,
  });

  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, attachments: `File is too large. Maximum size is 5MB.` }));
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });
      
      setFormData(prev => ({
        ...prev,
        attachments: blob,
      }));
      setUploadedFile({ name: file.name, size: file.size });
      setErrors(prev => ({ ...prev, attachments: '' }));
    } catch (error) {
      console.error('Error processing file:', error);
      setErrors(prev => ({ ...prev, attachments: `Failed to process file ${file.name}` }));
    }
    
    e.target.value = '';
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      attachments: null,
    }));
    setUploadedFile(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError('');

    if (!validateForm()) {
      return;
    }

    try {
      await submitFormMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        attachments: formData.attachments,
      });
      
      setShowSuccess(true);
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        attachments: null,
      });
      setUploadedFile(null);
      setUploadProgress(0);
      setErrors({});

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = getUserFriendlyErrorMessage(error);
      setSubmissionError(errorMessage);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <section id="contact" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get Your Free Quote
          </h2>
          <p className="text-lg text-muted-foreground">
            Fill out the form below and our team will contact you within 24 hours
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-success/10 border border-success rounded-lg flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
            <div>
              <p className="font-semibold text-success">Application Submitted Successfully!</p>
              <p className="text-sm text-success/80">We'll review your information and get back to you soon.</p>
            </div>
          </div>
        )}

        {submissionError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Submission Failed</p>
              <p className="text-sm text-destructive/80">{submissionError}</p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Customer Information Form</CardTitle>
            <CardDescription>
              Please provide your details and we'll get back to you shortly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(123) 456-7890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Supporting Documents (Optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Upload any relevant documents (Max 5MB)
                </p>
                
                {uploadedFile ? (
                  <div className="border rounded-lg p-3 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-2">
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      id="attachments"
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <label
                      htmlFor="attachments"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOC, DOCX, JPG, PNG (max 5MB)
                      </p>
                    </label>
                  </div>
                )}
                {errors.attachments && (
                  <p className="text-sm text-destructive">{errors.attachments}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={submitFormMutation.isPending}
                className="w-full"
                size="lg"
              >
                {submitFormMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
