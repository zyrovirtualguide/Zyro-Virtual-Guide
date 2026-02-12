
export interface Place {
  name: string;
  lat: number;
  lng: number;
  category?: string;
  description?: string;
}

export interface ItineraryDay {
  day: number;
  activities: {
    time: string;
    activity: string;
    location: string;
    description: string;
    lat?: number;
    lng?: number;
  }[];
}

export interface TravelSuggestion {
  location: string;
  region: string;
  why: string;
  highlight: string;
  bestTime: string;
  logistics: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}
