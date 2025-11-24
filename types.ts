export enum AppStage {
  INTRO = 'INTRO',
  TOKENIZATION = 'TOKENIZATION',
  EMBEDDING = 'EMBEDDING',
  TRANSFORMER = 'TRANSFORMER', // Changed from ATTENTION to encompass the whole layer
  PREDICTION = 'PREDICTION'
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface WordToken {
  id: number;
  text: string;
  tokenId: number; // The integer ID (e.g. 1045)
  vector: Vector3D;
  category: 'noun' | 'verb' | 'adjective' | 'other';
}

export interface AttentionHead {
  id: number;
  color: string;
}
