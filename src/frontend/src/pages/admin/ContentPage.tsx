import { useState, useEffect } from 'react';
import { useGetSiteContent, useUpdateSiteContent } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, Save, AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';

export default function ContentPage() {
  const { data: siteContent, isLoading, error } = useGetSiteContent();
  const updateContentMutation = useUpdateSiteContent();

  const [homeTitle, setHomeTitle] = useState('');
  const [homeDescription, setHomeDescription] = useState('');
  const [heroText, setHeroText] = useState('');
  const [generalInfo, setGeneralInfo] = useState('');
  const [heroImage, setHeroImage] = useState<ExternalBlob | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    if (siteContent) {
      setHomeTitle(siteContent.homeTitle);
      setHomeDescription(siteContent.homeDescription);
      setHeroText(siteContent.heroText);
      setGeneralInfo(siteContent.generalInfo);
      setHeroImage(siteContent.heroImage || null);
      if (siteContent.heroImage) {
        setHeroImagePreview(siteContent.heroImage.getDirectURL());
      }
    }
  }, [siteContent]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      setHeroImage(blob);
      setHeroImagePreview(blob.getDirectURL());
      setUploadProgress(0);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setHeroImage(null);
    setHeroImagePreview(null);
  };

  const handleSave = async () => {
    if (!homeTitle.trim() || !homeDescription.trim() || !heroText.trim()) {
      toast.error('Title, description, and hero text are required');
      return;
    }

    try {
      await updateContentMutation.mutateAsync({
        homeTitle: homeTitle.trim(),
        homeDescription: homeDescription.trim(),
        heroText: heroText.trim(),
        heroImage: heroImage || undefined,
        generalInfo: generalInfo.trim(),
        services: siteContent?.services || [],
        testimonials: siteContent?.testimonials || [],
      });

      toast.success('Site content updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update content');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-foreground font-medium">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-2 border-destructive bg-destructive/10">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <AlertDescription className="text-destructive font-semibold">
          Failed to load content. {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Content Management</h1>
        <p className="text-muted-foreground">Edit site content, titles, descriptions, and images</p>
      </div>

      <Card className="border-2 border-border">
        <CardHeader className="bg-muted border-b-2 border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">Site Content</CardTitle>
              <CardDescription className="text-foreground font-medium">
                Update homepage and hero section content
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="home-title" className="text-foreground font-semibold">
              Home Title
            </Label>
            <Input
              id="home-title"
              value={homeTitle}
              onChange={(e) => setHomeTitle(e.target.value)}
              placeholder="Enter home page title"
              className="border-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="home-description" className="text-foreground font-semibold">
              Home Description
            </Label>
            <Textarea
              id="home-description"
              value={homeDescription}
              onChange={(e) => setHomeDescription(e.target.value)}
              placeholder="Enter home page description"
              rows={3}
              className="border-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero-text" className="text-foreground font-semibold">
              Hero Text
            </Label>
            <Input
              id="hero-text"
              value={heroText}
              onChange={(e) => setHeroText(e.target.value)}
              placeholder="Enter hero section text"
              className="border-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="general-info" className="text-foreground font-semibold">
              General Information
            </Label>
            <Textarea
              id="general-info"
              value={generalInfo}
              onChange={(e) => setGeneralInfo(e.target.value)}
              placeholder="Enter general information"
              rows={4}
              className="border-2"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-semibold">Hero Image</Label>
            {heroImagePreview ? (
              <div className="relative">
                <img
                  src={heroImagePreview}
                  alt="Hero preview"
                  className="w-full max-w-2xl h-64 object-cover rounded-lg border-2 border-border"
                />
                <Button
                  onClick={handleRemoveImage}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Label
                  htmlFor="hero-image-upload"
                  className="cursor-pointer text-primary hover:text-primary/80 font-semibold"
                >
                  Click to upload hero image
                </Label>
                <Input
                  id="hero-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground mt-2">Max 5MB</p>
              </div>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={updateContentMutation.isPending}
              className="px-8"
            >
              {updateContentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
