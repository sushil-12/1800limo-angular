import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AmenitiesService {
  private selectedAmenitiesSubject = new BehaviorSubject<number[]>(
    this.loadFromQuotebotForm()
  );
  public selectedAmenities$: Observable<number[]> = this.selectedAmenitiesSubject.asObservable();

  private loadFromQuotebotForm(): number[] {
    try {
      const form = JSON.parse(localStorage.getItem('quotebot_form') || '{}');
      return Array.isArray(form.amenities) ? form.amenities : [];
    } catch {
      return [];
    }
  }

  updateSelectedAmenities(amenities: number[]): void {
    try {
      const form = JSON.parse(localStorage.getItem('quotebot_form') || '{}');
      form.amenities = amenities;
      localStorage.setItem('quotebot_form', JSON.stringify(form));
    } catch {}
    this.selectedAmenitiesSubject.next(amenities);
  }

  getCurrentValue(): number[] {
    return this.selectedAmenitiesSubject.getValue();
  }
}