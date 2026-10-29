import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VehiculosService } from '../../core/services/vehiculos.service';
import { ClientesService } from '../../core/services/clientes.service';
import { Vehiculo, Cliente } from '../../core/models';
import { AuthService } from '../../core/auth/auth.service';
import { SiPermiso } from '../../shared/directives/si-permiso';
@Component({
  imports: [FormsModule, RouterLink, SiPermiso],
  template: `<div class="page-heading">
      <div>
        <span class="eyebrow">CATÁLOGO / VEHICULOS</span>
        <h1>Vehículos y clientes</h1>
        <p class="muted">Consulta y administra los vehículos que atendemos.</p>
      </div>
      <a *siPermiso="'VEHICULO_ESCRIBIR'" class="button primary" routerLink="/vehiculos/nuevo"
        >+ Nuevo vehiculo</a
      >
    </div>
    <section class="panel">
      <div class="toolbar">
        <select aria-label="Filtrar por cliente" [(ngModel)]="clienteId" (ngModelChange)="cargar()">
          <option value="">Todos los clientes</option>
          @for (c of clientes(); track c.id) {
            <option [value]="c.id">{{ c.nombres }}</option>
          }</select
        ><span class="muted">{{ visibles().length }} registros</span
        ><button (click)="cargar()">Actualizar</button>
      </div>
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }
      @if (mensaje()) {
        <p class="success" role="status">{{ mensaje() }}</p>
      }
      @if (loading()) {
        <div class="empty">Cargando desde Oracle…</div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Cliente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (x of visibles(); track x.id) {
                <tr>
                  <td>
                    <strong>{{ x.placa }}</strong>
                  </td>
                  <td>{{ x.marca }}</td>
                  <td>{{ x.modelo }}</td>
                  <td>{{ x.anio }}</td>
                  <td>{{ x.clienteNombre }}</td>
                  <td class="actions">
                    <a
                      *siPermiso="'VEHICULO_ESCRIBIR'"
                      [routerLink]="['/vehiculos', x.id, 'editar']"
                      >Editar</a
                    ><button *siPermiso="'VEHICULO_ESCRIBIR'" class="danger-text" (click)="baja(x)">
                      Eliminar
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="empty">No hay registros para mostrar.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>`,
})
export class VehiculosList {
  api = inject(VehiculosService);
  auth = inject(AuthService);
  items = signal<Vehiculo[]>([]);
  loading = signal(false);
  error = signal('');
  mensaje = signal('');
  clienteId = '';
  clientes = signal<Cliente[]>([]);
  visibles() {
    return this.items();
  }
  constructor() {
    inject(ClientesService)
      .listar()
      .subscribe({
        next: (r) => this.clientes.set(r),
        error: (e) => this.error.set(e.error?.mensaje || 'Error al cargar clientes'),
      });
    this.cargar();
  }
  cargar() {
    this.loading.set(true);
    this.error.set('');
    this.api.listar(this.clienteId ? { clienteId: this.clienteId } : {}).subscribe({
      next: (r) => {
        this.items.set(r);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.mensaje || 'No se pudo conectar con la API');
        this.loading.set(false);
      },
    });
  }
  baja(x: Vehiculo) {
    if (!confirm('¿Confirmas eliminar este vehículo?')) return;
    this.api.eliminar(x.id).subscribe({
      next: () => {
        this.mensaje.set('Operación realizada correctamente');
        this.cargar();
      },
      error: (e) => this.error.set(e.error?.mensaje || 'No se pudo completar la operación'),
    });
  }
}
