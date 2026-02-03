import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import type { InsuranceType } from '../backend';

interface DashboardFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: InsuranceType | 'all';
  onFilterChange: (value: InsuranceType | 'all') => void;
  sortBy: 'name' | 'date';
  onSortChange: (value: 'name' | 'date') => void;
}

export default function DashboardFilters({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  sortBy,
  onSortChange,
}: DashboardFiltersProps) {
  return (
    <Card className="mb-6 border-2 border-primary/20 bg-card shadow-light">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-12 border-2 border-primary/20 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary transition-smooth font-medium"
            />
          </div>

          <Select value={filterType} onValueChange={onFilterChange}>
            <SelectTrigger className="h-12 border-2 border-primary/20 bg-background text-foreground focus:border-primary focus:ring-primary transition-smooth font-medium">
              <SelectValue placeholder="Filter by insurance type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-2 border-primary/20">
              <SelectItem value="all" className="text-foreground font-medium hover:bg-muted">All Types</SelectItem>
              <SelectItem value="life" className="text-foreground font-medium hover:bg-muted">Life Insurance</SelectItem>
              <SelectItem value="health" className="text-foreground font-medium hover:bg-muted">Health Insurance</SelectItem>
              <SelectItem value="vehicle" className="text-foreground font-medium hover:bg-muted">Vehicle Insurance</SelectItem>
              <SelectItem value="property" className="text-foreground font-medium hover:bg-muted">Property Insurance</SelectItem>
              <SelectItem value="travel" className="text-foreground font-medium hover:bg-muted">Travel Insurance</SelectItem>
              <SelectItem value="personalAccident" className="text-foreground font-medium hover:bg-muted">Personal Accident</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-12 border-2 border-primary/20 bg-background text-foreground focus:border-primary focus:ring-primary transition-smooth font-medium">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-2 border-primary/20">
              <SelectItem value="date" className="text-foreground font-medium hover:bg-muted">Sort by Date</SelectItem>
              <SelectItem value="name" className="text-foreground font-medium hover:bg-muted">Sort by Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

