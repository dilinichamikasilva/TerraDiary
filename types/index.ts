export interface TravelPost {
  id: string;
  userId: string;
  title: string;
  description: string;
  locationName: string;
  isPublic: boolean;
  imageUrl?: string; 
  mood?: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  } | any; 
  latitude?: number;
  longitude?: number;
}