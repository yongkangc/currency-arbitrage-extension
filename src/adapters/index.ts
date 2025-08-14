import { SiteAdapter } from './base-adapter';
import { NetflixAdapter } from './netflix-adapter';
import { SpotifyAdapter } from './spotify-adapter';

export class AdapterFactory {
  private static adapters: Map<string, new () => SiteAdapter> = new Map<string, new () => SiteAdapter>([
    ['netflix.com', NetflixAdapter],
    ['spotify.com', SpotifyAdapter],
  ]);
  
  static createAdapter(): SiteAdapter | null {
    const hostname = window.location.hostname;
    
    for (const [domain, AdapterClass] of this.adapters) {
      if (hostname.includes(domain)) {
        return new AdapterClass();
      }
    }
    
    return null;
  }
  
  static registerAdapter(domain: string, adapter: new () => SiteAdapter): void {
    this.adapters.set(domain, adapter);
  }
}

export { SiteAdapter } from './base-adapter';
export { NetflixAdapter } from './netflix-adapter';
export { SpotifyAdapter } from './spotify-adapter';