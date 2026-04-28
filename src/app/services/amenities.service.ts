import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AmenitiesService {

  private selectedAmenitiesSubject = new BehaviorSubject<number[]>(
    this.loadFromQuotebotForm()
  );

  public selectedAmenities$: Observable<number[]> =
    this.selectedAmenitiesSubject.asObservable();

  private loadFromQuotebotForm(): number[] {
    try {
      const form = JSON.parse(localStorage.getItem('quotebot_form') || '{}');
      const sessionFilters = JSON.parse(sessionStorage.getItem('filters') || '{}');

      const formAmenities: number[] = Array.isArray(form?.amenities)
        ? form.amenities.map(Number).filter(n => !isNaN(n) && n > 0)
        : [];

      const sessionAmenities: number[] = Array.isArray(sessionFilters?.request?.amenities)
        ? sessionFilters.request.amenities.map(Number).filter(n => !isNaN(n) && n > 0)
        : [];

      const merged = [...new Set([...formAmenities, ...sessionAmenities])];
      console.log('[AmenitiesService] loaded amenities:', merged);
      return merged;
    } catch {
      return [];
    }
  }

  // Called on every checkbox change
  updateSelectedAmenities(amenities: number[]): void {
    const clean = [...new Set(amenities.map(Number).filter(n => !isNaN(n) && n > 0))];
    try {
      const form = JSON.parse(localStorage.getItem('quotebot_form') || '{}');
      form.amenities = clean;
      localStorage.setItem('quotebot_form', JSON.stringify(form));
    } catch {}
    console.log('[AmenitiesService] updated amenities:', clean);
    this.selectedAmenitiesSubject.next(clean);
  }

  getCurrentValue(): number[] {
    return this.selectedAmenitiesSubject.getValue();
  }

  // Call this after session filters are confirmed loaded
  reloadFromStorage(): void {
    this.selectedAmenitiesSubject.next(this.loadFromQuotebotForm());
  }
}