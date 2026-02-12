import { CustomerForm } from '../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DashboardTableProps {
  forms: CustomerForm[];
}

export default function DashboardTable({ forms }: DashboardTableProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownloadDocument = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (forms.length === 0) {
    return (
      <div className="text-center py-12 bg-card border-2 border-border rounded-xl">
        <p className="text-muted-foreground text-lg font-medium">No submissions yet</p>
        <p className="text-sm text-muted-foreground mt-2">Customer form submissions will appear here</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-border rounded-xl overflow-hidden bg-white shadow-lg">
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader className="bg-primary sticky top-0 z-10">
            <TableRow className="hover:bg-primary border-b-2 border-primary-foreground/20">
              <TableHead className="text-primary-foreground font-bold text-sm">ID</TableHead>
              <TableHead className="text-primary-foreground font-bold text-sm">Name</TableHead>
              <TableHead className="text-primary-foreground font-bold text-sm">Email</TableHead>
              <TableHead className="text-primary-foreground font-bold text-sm">Phone</TableHead>
              <TableHead className="text-primary-foreground font-bold text-sm">Address</TableHead>
              <TableHead className="text-primary-foreground font-bold text-sm">Attachments</TableHead>
              <TableHead className="text-primary-foreground font-bold text-sm">Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form, index) => {
              const documentUrl = form.attachments?.getDirectURL();
              
              return (
                <TableRow 
                  key={form.id.toString()} 
                  className={`border-b-2 border-border hover:bg-muted/50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-muted/20'
                  }`}
                >
                  <TableCell className="font-medium text-foreground">
                    #{form.id.toString()}
                  </TableCell>
                  <TableCell className="font-medium text-foreground whitespace-nowrap">
                    {form.name}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {form.email}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {form.phone || 'N/A'}
                  </TableCell>
                  <TableCell className="text-foreground max-w-xs truncate">
                    {form.address || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {documentUrl ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(documentUrl)}
                          className="border-2 border-border hover:border-primary hover:bg-primary/10"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadDocument(documentUrl, `document-${form.id}.pdf`)}
                          className="border-2 border-border hover:border-primary hover:bg-primary/10"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No attachments</span>
                    )}
                  </TableCell>
                  <TableCell className="text-foreground text-sm whitespace-nowrap">
                    {formatDate(form.timestamp)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
