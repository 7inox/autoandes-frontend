import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Ingreso } from '../models';
@Injectable({ providedIn: 'root' })
export class ReportesService {
  private http = inject(HttpClient);
  ingresos(params: Record<string, string>) {
    return this.http.get<Ingreso[]>(environment.apiUrl + '/reportes/ingresos-por-servicio', {
      params,
    });
  }
}
