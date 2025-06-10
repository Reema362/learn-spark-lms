
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from 'lucide-react';

interface TemplateFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'course-assignment', label: 'Course Assignment' },
  { value: 'course-completion', label: 'Course Completion' },
  { value: 'course-reminder', label: 'Course Reminder' },
  { value: 'course-quiz-failure', label: 'Course Quiz Failure' },
  { value: 'manager-reminder', label: 'Manager Reminder' },
  { value: 'course-certification', label: 'Course Certification' },
  { value: 'custom', label: 'Custom' }
];

const TemplateFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType
}: TemplateFiltersProps) => {
  return (
    <div className="flex gap-4 items-center">
      <div className="flex items-center space-x-2 flex-1">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          {categories.map(category => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedType} onValueChange={setSelectedType}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="sms">SMS</SelectItem>
          <SelectItem value="alert">Alert</SelectItem>
          <SelectItem value="notification">Notification</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TemplateFilters;
