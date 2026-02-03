import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Phone, MapPin, MessageSquare, FileText, Download, ExternalLink } from 'lucide-react';
import type { CustomerForm } from '../backend';
import { toast } from 'sonner';

interface DashboardTableProps {
  forms: CustomerForm[];
}

const insuranceTypeColors: Record<string, string> = {
  life: 'bg-red-500 text-white border-red-600',
  health: 'bg-green-500 text-white border-green-600',
  vehicle: 'bg-blue-500 text-white border-blue-600',
  property: 'bg-orange-500 text-white border-orange-600',
  travel: 'bg-purple-500 text-white border-purple-600',
  personalAccident: 'bg-gray-500 text-white border-gray-600',
};

const insuranceTypeLabels: Record<string, string> = {
  life: 'Life',
  health: 'Health',
  vehicle: 'Vehicle',
  property: 'Property',
  travel: 'Travel',
  personalAccident: 'Personal Accident',
};

export default function DashboardTable({ forms }: DashboardTableProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadDocument = async (blob: any, index: number, customerName: string) => {
    try {
      const url = blob.getDirectURL();
      const link = document.createElement('a');
      link.href = url;
      link.download = `${customerName.replace(/\s+/g, '_')}_document_${index + 1}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Document download started');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleViewDocument = async (blob: any) => {
    try {
      const url = blob.getDirectURL();
      window.open(url, '_blank');
      toast.success('Opening document in new tab');
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to open document');
    }
  };

  if (forms.length === 0) {
    return (
      <Card className="border-2 border-primary/20 bg-card shadow-light">
        <CardContent className="py-12">
          <div className="text-center text-foreground">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-bold">No submissions found</p>
            <p className="text-sm font-medium text-muted-foreground">Try adjusting your filters or search terms</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-card shadow-light">
      <CardHeader className="border-b-2 border-primary/20 bg-muted">
        <CardTitle className="text-xl font-bold text-foreground">
          Customer Submissions ({forms.length} {forms.length === 1 ? 'record' : 'records'})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted z-10">
                <TableRow className="bg-muted border-b-2 border-primary/20 hover:bg-muted">
                  <TableHead className="font-bold text-foreground min-w-[200px]">Customer Details</TableHead>
                  <TableHead className="font-bold text-foreground min-w-[220px]">Contact Information</TableHead>
                  <TableHead className="font-bold text-foreground min-w-[200px]">Insurance Interests</TableHead>
                  <TableHead className="font-bold text-foreground min-w-[250px]">Customer Feedback</TableHead>
                  <TableHead className="font-bold text-foreground min-w-[180px]">Uploaded Documents</TableHead>
                  <TableHead className="font-bold text-foreground min-w-[150px]">Submission Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form) => (
                  <TableRow key={form.id.toString()} className="border-b border-primary/20 hover:bg-muted/50 transition-smooth">
                    <TableCell className="py-4 align-top">
                      <div>
                        <p className="font-bold text-foreground text-base mb-1">{form.name}</p>
                        {form.address && (
                          <div className="flex items-start gap-1 mt-2">
                            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                              {form.address}
                            </p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-top">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                          <p className="text-sm font-medium text-foreground break-all">
                            {form.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                          <p className="text-sm font-medium text-foreground">
                            {form.phone}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {form.insuranceInterests.map((interest, idx) => (
                          <Badge
                            key={idx}
                            className={`${insuranceTypeColors[interest] || 'bg-gray-500 text-white border-gray-600'} border-2 font-bold text-xs px-2 py-1`}
                          >
                            {insuranceTypeLabels[interest] || interest}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-top">
                      <div className="max-w-sm">
                        {form.feedback && form.feedback.trim() ? (
                          <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                            {form.feedback}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic font-medium">No feedback provided</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-top">
                      <div className="space-y-2">
                        {form.uploadedDocuments && form.uploadedDocuments.length > 0 ? (
                          form.uploadedDocuments.map((doc, idx) => (
                            <div key={idx} className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDocument(doc)}
                                className="flex-1 justify-start border-2 border-border hover:border-primary transition-smooth"
                                title="View document in new tab"
                              >
                                <FileText className="h-4 w-4 mr-2 text-primary" />
                                <span className="text-xs font-medium">Doc {idx + 1}</span>
                                <ExternalLink className="h-3 w-3 ml-auto" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadDocument(doc, idx, form.name)}
                                className="border-2 border-border hover:border-primary transition-smooth px-2"
                                title="Download document"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground italic font-medium">No documents uploaded</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-top">
                      <p className="text-sm text-foreground whitespace-nowrap font-medium">
                        {formatDate(form.timestamp)}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

