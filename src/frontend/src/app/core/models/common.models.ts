export interface Ward {
  key: number;        
  description: string; 
}

export interface WardListResponse {
  wards: Ward[];
}