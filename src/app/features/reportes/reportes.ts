import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ReportesService } from '../../core/services/reportes.service';
import { Ingreso } from '../../core/models';
@Component({
  imports: [FormsModule, CurrencyPipe],
  template: `<div class="page-heading">
      <div>
        <span class="eyebrow">ANÁLISIS / REPORTE</span>
        <h1>Ingresos por servicio</h1>
        <p class="muted">Importes de órdenes registradas. Las anuladas quedan excluidas.</p>
      </div>
      <span class="badge">Consolidado Oracle</span>
    </div>
    <div class="summary-cards">
      <div class="summary-card">
        <span class="muted">Ingreso del periodo</span
        ><strong>{{ total() | currency: 'PEN' : 'S/ ' }}</strong>
      </div>
      <div class="summary-card">
        <span class="muted">Servicios del reporte</span><strong>{{ items().length }}</strong>
      </div>
      <div class="summary-card">
        <span class="muted">Unidades atendidas</span><strong>{{ cantidad() }}</strong>
      </div>
    </div>
    <section class="panel">
      <form class="filter-row" (ngSubmit)="cargar()">
        <label>Desde<input type="date" name="desde" [(ngModel)]="desde" /></label
        ><label>Hasta<input type="date" name="hasta" [(ngModel)]="hasta" /></label
        ><button class="primary">Actualizar reporte</button>
      </form>
      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
      @if (loading()) {
        <div class="empty">Generando reporte…</div>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Servicio</th>
              <th>Cantidad total</th>
              <th>Importe total</th>
            </tr>
          </thead>
          <tbody>
            @for (r of items(); track r.codigo) {
              <tr>
                <td>
                  <strong>{{ r.codigo }}</strong>
                </td>
                <td>{{ r.servicio }}</td>
                <td>{{ r.cantidadTotal }}</td>
                <td>{{ r.importeTotal | currency: 'PEN' : 'S/ ' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="empty">No hay ingresos en este periodo.</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>`,
})
export class Reportes {
  private api = inject(ReportesService);
  items = signal<Ingreso[]>([]);
  loading = signal(false);
  error = signal('');
  desde = '';
  hasta = '';
  constructor() {
    this.cargar();
  }
  total() {
    return this.items().reduce((a, r) => a + r.importeTotal, 0);
  }
  cantidad() {
    return this.items().reduce((a, r) => a + r.cantidadTotal, 0);
  }
  cargar() {
    this.loading.set(true);
    this.error.set('');
    this.api
      .ingresos(
        Object.fromEntries(
          Object.entries({ desde: this.desde, hasta: this.hasta }).filter(([, v]) => !!v),
        ),
      )
      .subscribe({
        next: (r) => {
          this.items.set(r);
          this.loading.set(false);
        },
        error: (e) => {
          this.loading.set(false);
          this.error.set(e.error?.mensaje || 'No se pudo generar el reporte');
        },
      });
  }
}
