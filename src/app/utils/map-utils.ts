export class MapUtils {

    /**
     * offsets overlapping markers VISUALLY (pixel space) to prevent them from hiding each other.
     * Returns the original LatLng and a pixel-based horizontal offset.
     * @param locations List of lat/lng coordinates
     * @param toleranceMeters Distance in meters to consider points as "overlapping" (default 50m)
     */
    static getOffsetMarkers(locations: google.maps.LatLngLiteral[], toleranceMeters: number = 50): { position: google.maps.LatLngLiteral, pixelOffset: number }[] {
        const markers = locations.map(l => ({ position: { ...l }, pixelOffset: 0 }));

        // Groups of indices that are overlapping
        const groups: { center: google.maps.LatLngLiteral, indices: number[] }[] = [];

        // 1. Group points
        markers.forEach((m, i) => {
            let placed = false;
            for (const group of groups) {
                const dist = this.calculateHaversineDistance(m.position.lat, m.position.lng, group.center.lat, group.center.lng);

                // If within tolerance, add to group
                if (dist < toleranceMeters) {
                    group.indices.push(i);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                // Start a new group
                groups.push({ center: m.position, indices: [i] });
            }
        });

        // 2. Apply offsets
        groups.forEach(group => {
            const count = group.indices.length;

            if (count > 1) {
                // Stride of 28px (approx the width of a marker)
                const stride = 28;
                const totalWidth = (count - 1) * stride;
                const startOffset = -totalWidth / 2;

                group.indices.forEach((index, i) => {
                    markers[index].pixelOffset = startOffset + (i * stride);
                });
            }
        });

        return markers;
    }

    /**
     * Calculates distance between two points in meters using Haversine formula.
     */
    static calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371e3; // Earth radius in meters
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}
