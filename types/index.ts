export interface TravelPost {
  id: string;
  userId: string;
  title: string;
  description: string;
  locationName: string;
  isPublic: boolean;
  mood?: string;
  createdAt?: any; 
}