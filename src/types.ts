export type PreviewTheme = 'dark' | 'light';

export interface ImageMetadata {
  src: string;        // Base64 or object URL of original image
  name: string;       // File name
  size: number;       // File size in bytes
  width: number;      // Original width
  height: number;     // Original height
  aspectRatio: number;// width / height
}

export interface ThumbnailAdjustment {
  mode: 'original' | 'converted'; // original uses padding, converted center-crops to 16:9
  processedSrc: string;           // Final data URL to render
  paddingStyle: 'black' | 'blurred' | 'gray';
}

export interface MockMetadata {
  title: string;
  channelName: string;
  avatarSrc: string;              // Custom avatar base64 or default SVG
  avatarColor: string;            // Default dynamic color if no custom upload
  duration: string;               // e.g. "14:20"
  views: string;                  // e.g. "425K"
  publishTime: string;            // e.g. "5 hours ago"
  unread: boolean;                // Whether the video card has blue unread badge
  progress: number;               // Current watch progress (0 to 100)
}
