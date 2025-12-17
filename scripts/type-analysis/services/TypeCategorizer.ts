import { TypeDefinition } from '../models/TypeDefinition';
import { CategoryName, CategorizedTypes } from '../models/TypeCategory';

export class TypeCategorizer {
  private readonly categoryCriteria: Record<CategoryName, (typeDef: TypeDefinition) => boolean> = {
    'Backend/DB': this.isBackendType.bind(this),
    'Frontend/UI': this.isFrontendType.bind(this),
    'Shared/Common': this.isSharedType.bind(this)
  };

  categorizeType(typeDef: TypeDefinition): CategoryName {
    // Check categories in order of specificity (most specific first)
    if (this.isBackendType(typeDef)) return 'Backend/DB';
    if (this.isFrontendType(typeDef)) return 'Frontend/UI';
    if (this.isSharedType(typeDef)) return 'Shared/Common';
    return 'Shared/Common'; // Default fallback
  }

  categorizeTypes(types: TypeDefinition[]): CategorizedTypes {
    const categorized: CategorizedTypes = {
      'Backend/DB': [],
      'Frontend/UI': [],
      'Shared/Common': []
    };

    for (const type of types) {
      const category = this.categorizeType(type);
      categorized[category].push(type);
    }

    return categorized;
  }

  private isBackendType(typeDef: TypeDefinition): boolean {
    const name = typeDef.name.toLowerCase();
    const filePath = typeDef.filePath.toLowerCase();

    // API response/request/error types
    if (name.includes('response') || name.includes('request') || name.includes('error')) {
      return true;
    }

    // Database-related types
    if (name.includes('schema') || name.includes('model') || name.includes('entity')) {
      return true;
    }

    // File path indicators
    if (filePath.includes('/api/') || filePath.includes('/database/') || filePath.includes('/backend/')) {
      return true;
    }

    // Service layer types
    if (filePath.includes('/services/') || (filePath.includes('/lib/') && filePath.includes('api'))) {
      return true;
    }

    return false;
  }

  private isFrontendType(typeDef: TypeDefinition): boolean {
    const name = typeDef.name.toLowerCase();
    const filePath = typeDef.filePath.toLowerCase();

    // UI component types
    if (name.includes('props') || name.includes('component') || name.includes('button') || name.includes('input')) {
      return true;
    }

    // Form-related types
    if (name.includes('form') && (name.includes('data') || name.includes('state'))) {
      return true;
    }

    // File path indicators
    if (filePath.includes('/components/') || filePath.includes('/ui/') || filePath.includes('/pages/')) {
      return true;
    }

    // React/state management types
    if (filePath.includes('/hooks/') || filePath.includes('/store/') || filePath.includes('/state/')) {
      return true;
    }

    return false;
  }

  private isSharedType(typeDef: TypeDefinition): boolean {
    const name = typeDef.name.toLowerCase();
    const filePath = typeDef.filePath.toLowerCase();

    // Domain entities
    if (name.match(/^(user|campaign|client|domain|template|lead)$/i)) {
      return true;
    }

    // Common types
    if (name.includes('common') || name.includes('shared') || name.includes('util')) {
      return true;
    }

    // Validation types
    if (name.includes('validation')) {
      return true;
    }

    // If name contains 'api' but not response/request/error, check context
    if (name.includes('api') && filePath.includes('/types/') && !filePath.includes('/api/')) {
      return false; // ApiResponse in types/common.ts should be Backend/DB if it contains 'api'
    }

    // Common directories
    if (filePath.includes('/types/') && !filePath.includes('/components/') && !filePath.includes('/api/')) {
      return true;
    }

    return false;
  }
}
