
import { DatabaseService } from '@/services/database';

export const createSampleCategories = async () => {
  try {
    // First check if categories already exist
    const existingCategories = await DatabaseService.getCourseCategories();
    
    // If we already have 5 or more categories, don't create more
    if (existingCategories && existingCategories.length >= 5) {
      console.log('Sample categories already exist, skipping creation');
      return;
    }

    const sampleCategories = [
      { name: 'Information Security', color: '#ef4444' },
      { name: 'Phishing Awareness', color: '#f97316' },
      { name: 'Social Engineering', color: '#eab308' },
      { name: 'Data Protection', color: '#22c55e' },
      { name: 'Compliance Training', color: '#3b82f6' },
      { name: 'Incident Response', color: '#8b5cf6' },
      { name: 'Password Security', color: '#ec4899' },
      { name: 'Mobile Security', color: '#06b6d4' }
    ];

    // Get existing category names to avoid duplicates
    const existingNames = new Set(existingCategories?.map(cat => cat.name.toLowerCase()) || []);

    // Filter out categories that already exist
    const categoriesToCreate = sampleCategories.filter(
      category => !existingNames.has(category.name.toLowerCase())
    );

    if (categoriesToCreate.length === 0) {
      console.log('All sample categories already exist');
      return;
    }

    console.log(`Creating ${categoriesToCreate.length} new sample categories`);

    // Create categories one by one to handle any individual failures
    for (const category of categoriesToCreate) {
      try {
        await DatabaseService.createCourseCategory(category);
        console.log(`Created category: ${category.name}`);
      } catch (error) {
        console.warn(`Failed to create category ${category.name}:`, error);
        // Continue with other categories even if one fails
      }
    }

    console.log('Sample categories creation completed');
  } catch (error) {
    console.error('Error creating sample categories:', error);
  }
};
