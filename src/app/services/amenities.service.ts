import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AmenitiesService {
  private selectedAmenitiesSubject = new BehaviorSubject<number[]>([]);
  public selectedAmenities$: Observable<number[]> = this.selectedAmenitiesSubject.asObservable();

  updateSelectedAmenities(amenities: number[]): void {
     console.log('🔵 Service: updateSelectedAmenities called with', amenities);
    this.selectedAmenitiesSubject.next(amenities);
  }

  getCurrentValue(): number[] {
    return this.selectedAmenitiesSubject.getValue();
  }
}