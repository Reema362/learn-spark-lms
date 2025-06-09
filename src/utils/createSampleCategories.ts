
import { DatabaseService } from '@/services/database';

const sampleCategories = [
  {
    name: 'Network Security',
    description: 'Securing network infrastructure and communications',
    color: '#FF6B6B'
  },
  {
    name: 'Information Security Fundamentals',
    description: 'Basic concepts and principles of information security',
    color: '#4ECDC4'
  },
  {
    name: 'Compliance & Governance',
    description: 'Regulatory compliance and security governance',
    color: '#45B7D1'
  },
  {
    name: 'Incident Response',
    description: 'Managing and responding to security incidents',
    color: '#96CEB4'
  },
  {
    name: 'Risk Management',
    description: 'Identifying and managing security risks',
    color: '#FFEAA7'
  },
  {
    name: 'Data Protection',
    description: 'Protecting sensitive data and privacy',
    color: '#DDA0DD'
  },
  {
    name: 'Application Security',
    description: 'Securing software applications and development',
    color: '#98D8C8'
  },
  {
    name: 'Identity & Access Management',
    description: 'Managing user identities and access controls',
    color: '#F7DC6F'
  }
];

export const createSampleCategories = async () => {
  try {
    console.log('Creating sample course categories...');
    
    for (const category of sampleCategories) {
      try {
        await DatabaseService.createCourseCategory(category);
        console.log(`Created category: ${category.name}`);
      } catch (error) {
        console.log(`Category ${category.name} might already exist`);
      }
    }
    
    console.log('Sample categories creation completed');
  } catch (error) {
    console.error('Error creating sample categories:', error);
  }
};

// Auto-create categories when module is imported
if (typeof window !== 'undefined') {
  createSampleCategories();
}
