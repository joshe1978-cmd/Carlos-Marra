
export type GarmentType = 'T-shirt' | 'Tank top' | 'Polo Shirt' | 'Hoodie';

export interface MockupResult {
  id: string;
  garmentType: GarmentType;
  flatImageUrl: string;
  modelImageUrl: string;
  patternUrl: string;
  timestamp: number;
}

export interface GenerationState {
  isGenerating: boolean;
  status: string;
  error?: string;
}
