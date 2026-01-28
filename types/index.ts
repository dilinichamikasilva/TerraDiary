export interface TravelPost {
  id: string;
  userId: string;
  userName: string; 
  title: string;
  description: string;
  locationName: string;
  isPublic: boolean;
  imageUrl?: string; 
  mood?: string;
  createdAt?: any; 
  latitude?: number;
  longitude?: number;
}