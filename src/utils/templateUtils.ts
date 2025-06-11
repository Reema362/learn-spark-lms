
export const getFilteredTemplates = (templates: any[], searchTerm: string, selectedType: string) => {
  return templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;
    return matchesSearch && matchesType;
  });
};

export const getTemplateCategory = (type: string) => {
  const categories = {
    email: 'Email Templates',
    sms: 'SMS Templates',
    alert: 'Alert Templates',
    notification: 'Notification Templates'
  };
  return categories[type as keyof typeof categories] || 'Unknown Category';
};
