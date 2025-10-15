import { TypeDefinition } from './TypeDefinition';

export type CategoryName = 'Backend/DB' | 'Frontend/UI' | 'Shared/Common';

export interface TypeCategory {
  name: CategoryName;
  criteria: string;
  examples: string[];
}

export interface CategorizedTypes {
  'Backend/DB': TypeDefinition[];
  'Frontend/UI': TypeDefinition[];
  'Shared/Common': TypeDefinition[];
}
