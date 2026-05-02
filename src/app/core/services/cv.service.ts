import { Injectable, signal } from '@angular/core';
import { CVData } from '../../shared/models/cv.model';
import cvDataRaw from '../../../assets/data.json';

@Injectable({
  providedIn: 'root'
})
export class CVService {
  private cvDataSignal = signal<CVData>(cvDataRaw as unknown as CVData);


  get cv(): CVData {
    return this.cvDataSignal();
  }

  updateData(newData: CVData) {
    this.cvDataSignal.set(newData);
  }


  getProjectBySlug(slug: string) {
    return this.cv.projects.find(p => p.slug === slug);
  }
}
