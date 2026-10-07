export const DEFAULT_LOC = { lat: 28.8386, lng: 78.7733 };
export const getLocation = (): Promise<{ lat: number; lng: number }> => new Promise(res => navigator.geolocation ? navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lng: p.coords.longitude }), () => res(DEFAULT_LOC), { timeout: 8000 }) : res(DEFAULT_LOC));
