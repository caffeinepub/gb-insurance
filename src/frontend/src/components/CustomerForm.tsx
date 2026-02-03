import { useState } from 'react';
import { useSubmitForm } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { InsuranceType, ExternalBlob } from '../backend';
import { Loader2, Send, CheckCircle2, Sparkles, Upload, X, FileText } from 'lucide-react';

const insuranceOptions = [
  { value: InsuranceType.life, label: 'Life Insurance', gradient: 'bg-primary' },
  { value: InsuranceType.health, label: 'Health Insurance', gradient: 'bg-primary' },
  { value: InsuranceType.vehicle, label: 'Vehicle Insurance', gradient: 'bg-primary' },
  { value: InsuranceType.property, label: 'Property Insurance', gradient: 'bg-primary' },
  { value: InsuranceType.travel, label: 'Travel Insurance', gradient: 'bg-primary' },
  { value: InsuranceType.personalAccident, label: 'Personal Accident', gradient: 'bg-muted' },
];

export default function CustomerForm() {
  const submitFormMutation = useSubmitForm();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    insuranceInterests: [] as InsuranceType[],
    feedback: '',
    documents: [] as ExternalBlob[],
  });

  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: number }>>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.insuranceInterests.length === 0) {
      newErrors.insuranceInterests = 'Please select at least one insurance type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocuments: ExternalBlob[] = [];
    const newFileInfo: Array<{ name: string; size: number }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, documents: `File ${file.name} is too large. Maximum size is 5MB.` }));
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(prev => ({ ...prev, [i]: percentage }));
        });
        
        newDocuments.push(blob);
        newFileInfo.push({ name: file.name, size: file.size });
      } catch (error) {
        console.error('Error processing file:', error);
        setErrors(prev => ({ ...prev, documents: `Failed to process file ${file.name}` }));
      }
    }

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments],
    }));
    setUploadedFiles(prev => [...prev, ...newFileInfo]);
    
    // Clear file input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await submitFormMutation.mutateAsync(formData);
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        insuranceInterests: [],
        feedback: '',
        documents: [],
      });
      setUploadedFiles([]);
      setUploadProgress({});
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCheckboxChange = (type: InsuranceType, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      insuranceInterests: checked
        ? [...prev.insuranceInterests, type]
        : prev.insuranceInterests.filter(t => t !== type),
    }));
    if (errors.insuranceInterests) {
      setErrors(prev => ({ ...prev, insuranceInterests: '' }));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <section id="contact" className="py-20 bg-gradient-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(0.75_0.12_85_/_0.04),transparent_70%)]"></div>
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4 shadow-gold">
            <Sparkles className="h-4 w-4" />
            <span>Get Started Today</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get Your Free Quote
          </h2>
          <p className="text-lg text-foreground">
            Fill out the form below and our team will contact you within 24 hours
          </p>
        </div>

        <Card className="shadow-2xl border-2 border-border animate-slide-up hover:shadow-3xl transition-smooth bg-white hover-shadow-gold">
          <CardHeader className="border-b-2 border-border bg-card">
            <CardTitle className="text-2xl font-bold text-foreground">Customer Information Form</CardTitle>
            <CardDescription className="text-base text-foreground">
              Please provide your details and insurance requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground">
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
                    className={`h-12 bg-input border-2 transition-smooth text-base text-foreground placeholder:text-muted-foreground ${
                      errors.name 
                        ? 'border-destructive focus:border-destructive focus-visible:ring-destructive' 
                        : 'border-border focus:border-primary focus-visible:ring-primary hover:border-primary'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive animate-fade-in font-medium">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    className={`h-12 bg-input border-2 transition-smooth text-base text-foreground placeholder:text-muted-foreground ${
                      errors.phone 
                        ? 'border-destructive focus:border-destructive focus-visible:ring-destructive' 
                        : 'border-border focus:border-primary focus-visible:ring-primary hover:border-primary'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive animate-fade-in font-medium">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
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
                  className={`h-12 bg-input border-2 transition-smooth text-base text-foreground placeholder:text-muted-foreground ${
                    errors.email 
                      ? 'border-destructive focus:border-destructive focus-visible:ring-destructive' 
                      : 'border-border focus:border-primary focus-visible:ring-primary hover:border-primary'
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive animate-fade-in font-medium">{errors.email}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="address" className="text-sm font-semibold text-foreground">
                  Address
                </Label>
                <Input
                  id="address"
                  placeholder="Your complete address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="h-12 bg-input border-2 border-border transition-smooth focus:border-primary focus-visible:ring-primary hover:border-primary text-base text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-foreground">
                  Insurance Interests <span className="text-destructive">*</span>
                </Label>
                <div className="grid md:grid-cols-2 gap-4 p-6 bg-card rounded-xl border-2 border-border">
                  {insuranceOptions.map((option) => (
                    <div 
                      key={option.value} 
                      className="flex items-center space-x-3 p-4 rounded-xl bg-white border-2 border-border transition-smooth hover:border-primary hover:shadow-lg hover:scale-105"
                    >
                      <Checkbox
                        id={option.value}
                        checked={formData.insuranceInterests.includes(option.value)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(option.value, checked as boolean)
                        }
                        className="transition-smooth h-5 w-5 border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <Label
                        htmlFor={option.value}
                        className="text-sm font-medium cursor-pointer transition-smooth hover:text-primary flex-1 text-foreground"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.insuranceInterests && (
                  <p className="text-sm text-destructive animate-fade-in font-medium">{errors.insuranceInterests}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="feedback" className="text-sm font-semibold text-foreground">
                  Additional Comments or Questions
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Tell us about your specific insurance needs or any questions you have..."
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  rows={5}
                  className="bg-input border-2 border-border transition-smooth focus:border-primary focus-visible:ring-primary hover:border-primary resize-none text-base text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="documents" className="text-sm font-semibold text-foreground">
                  Upload Supporting Documents (Optional)
                </Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-2 border-border hover:border-primary transition-smooth"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Files
                    </Button>
                    <p className="text-sm text-muted-foreground font-medium">
                      Max 5MB per file. Supported: PDF, JPG, PNG, DOC
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-card border-2 border-border rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="h-5 w-5 text-primary" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {errors.documents && (
                    <p className="text-sm text-destructive animate-fade-in font-medium">{errors.documents}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-95 text-lg py-7 transition-smooth shadow-gold hover-shadow-gold font-bold border-2 border-primary"
                disabled={submitFormMutation.isPending}
              >
                {submitFormMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Submitting...
                  </>
                ) : submitFormMutation.isSuccess ? (
                  <>
                    <CheckCircle2 className="mr-2 h-6 w-6" />
                    Submitted Successfully!
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-6 w-6" />
                    Submit Form
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

