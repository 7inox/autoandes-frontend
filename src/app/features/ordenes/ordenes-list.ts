import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrdenesService } from '../../core/services/ordenes.service';
import { Orden } from '../../core/models';
import { SiPermiso } from '../../shared/directives/si-permiso';
import { RouterLink } from '@angular/router';
@Component({
  imports: [FormsModule, CurrencyPipe, DatePipe, SiPermiso, RouterLink],
  template: `<div class="page-heading">
      <div>
        <span class="eyebrow">OPERACIONES / CONSULTA</span>
        <h1>Órdenes de servicio</h1>
        <p class="muted">Sigue cada visita, desde el registro hasta el cierre.</p>
      </div>
      <a *siPermiso="'ORDEN_REGISTRAR'" class="button primary" routerLink="/ordenes/nueva"
        >+ Nueva orden</a
      >
    </div>
    <section class="panel">
      <form class="filter-row" (ngSubmit)="cargar()">
        <label>Placa<input name="placa" [(ngModel)]="filtros.placa" placeholder="ABC-123" /></label
        ><label
          >Estado<select name="estado" [(ngModel)]="filtros.estado">
            <option value="">Todos</option>
            <option>REGISTRADA</option>
            <option>ANULADA</option>
          </select></label
        ><label>Desde<input type="date" name="desde" [(ngModel)]="filtros.desde" /></label
        ><label>Hasta<input type="date" name="hasta" [(ngModel)]="filtros.hasta" /></label
        ><button class="primary">Consultar</button>
      </form>
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }
      @if (loading()) {
        <div class="empty">Consultando órdenes…</div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Orden</th>
                <th>Fecha</th>
                <th>Vehículo / cliente</th>
                <th>Kilometraje</th>
                <th>Estado</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (o of items(); track o.id) {
                <tr>
                  <td>
                    <strong>{{ o.numero }}</strong>
                  </td>
                  <td>{{ o.fecha | date: 'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    {{ o.placa }}<br /><small>{{ o.clienteNombre }}</small>
                  </td>
                  <td>{{ o.kilometraje }}</td>
                  <td>
                    <span class="badge" [class.inactive]="o.estado === 'ANULADA'">{{
                      o.estado
                    }}</span>
                  </td>
                  <td>{{ o.total | currency: 'PEN' : 'S/ ' }}</td>
                  <td><button (click)="ver(o.id)">Ver detalle</button></td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="empty">No se encontraron órdenes.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
    @if (seleccionada(); as o) {
      <section class="panel detail-box" style="margin-top:24px">
        <div class="page-heading">
          <div>
            <span class="eyebrow">DETALLE DE LA VISITA</span>
            <h2>{{ o.numero }}</h2>
            <p>{{ o.placa }} · {{ o.clienteNombre }} · {{ o.estado }}</p>
          </div>
          <button (click)="seleccionada.set(null)">Cerrar</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Cantidad</th>
              <th>Precio unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            @for (d of o.detalles; track d.id) {
              <tr>
                <td>{{ d.servicioCodigo }} · {{ d.servicioNombre }}</td>
                <td>{{ d.cantidad }}</td>
                <td>{{ d.precioUnitario | currency: 'PEN' : 'S/ ' }}</td>
                <td>{{ d.subtotal | currency: 'PEN' : 'S/ ' }}</td>
              </tr>
            }
          </tbody>
        </table>
        <div class="total-box">
          Total <strong>{{ o.total | currency: 'PEN' : 'S/ ' }}</strong>
        </div>
        @if (o.motivoAnulacion) {
          <p>Motivo: {{ o.motivoAnulacion }}</p>
        }
        @if (o.estado === 'REGISTRADA') {
          <div *siPermiso="'ORDEN_ANULAR'" class="form-actions">
            <label class="full"
              >Motivo de anulación (10–200 caracteres)<textarea
                [(ngModel)]="motivo"
                minlength="10"
                maxlength="200"
              ></textarea></label
            ><button
              class="danger-text"
              [disabled]="motivo.trim().length < 10 || anulando()"
              (click)="anular(o.id)"
            >
              Anular orden
            </button>
          </div>
        }
      </section>
    }`,
})
export class OrdenesList {
  private api = inject(OrdenesService);
  items = signal<Orden[]>([]);
  seleccionada = signal<Orden | null>(null);
  loading = signal(false);
  anulando = signal(false);
  error = signal('');
  motivo = '';
  filtros = { placa: '', estado: '', desde: '', hasta: '' };
  constructor() {
    this.cargar();
  }
  cargar() {
    this.error.set('');
    this.loading.set(true);
    this.api
      .listar(Object.fromEntries(Object.entries(this.filtros).filter(([, v]) => !!v)))
      .subscribe({
        next: (r) => {
          this.items.set(r);
          this.loading.set(false);
        },
        error: (e) => {
          this.error.set(e.error?.mensaje || 'Error de conexión');
          this.loading.set(false);
        },
      });
  }
  ver(id: number) {
    this.api.obtener(id).subscribe({
      next: (r) => {
        this.seleccionada.set(r);
        this.motivo = '';
      },
      error: (e) => this.error.set(e.error?.mensaje || 'No se pudo cargar el detalle'),
    });
  }
  anular(id: number) {
    if (!confirm('¿Confirmas la anulación de esta orden?')) return;
    this.anulando.set(true);
    this.api.anular(id, this.motivo).subscribe({
      next: (r) => {
        this.seleccionada.set(r);
        this.anulando.set(false);
        this.cargar();
      },
      error: (e) => {
        this.anulando.set(false);
        this.error.set(e.error?.mensaje || 'No se pudo anular');
      },
    });
  }
}
