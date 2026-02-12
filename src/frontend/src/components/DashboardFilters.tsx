import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface DashboardFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: 'newest' | 'oldest' | 'name';
  onSortChange: (value: 'newest' | 'oldest' | 'name') => void;
}

export default function DashboardFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
}: DashboardFiltersProps) {
  return (
    <Card className="mb-6 border-2 border-primary/20 bg-card shadow-light">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, phone, address..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-12 border-2 border-primary/20 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary transition-smooth font-medium"
            />
          </div>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-12 border-2 border-primary/20 bg-background text-foreground focus:border-primary focus:ring-primary transition-smooth font-medium">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-2 border-primary/20">
              <SelectItem value="newest" className="text-foreground font-medium hover:bg-muted">Newest First</SelectItem>
              <SelectItem value="oldest" className="text-foreground font-medium hover:bg-muted">Oldest First</SelectItem>
              <SelectItem value="name" className="text-foreground font-medium hover:bg-muted">Sort by Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
