import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VehiculosService } from '../../core/services/vehiculos.service';
import { ServiciosService } from '../../core/services/servicios.service';
import { OrdenesService } from '../../core/services/ordenes.service';
import { Vehiculo, Servicio, Orden } from '../../core/models';
@Component({
  imports: [ReactiveFormsModule, CurrencyPipe, RouterLink],
  template: `<div class="page-heading">
      <div>
        <span class="eyebrow">OPERACIONES / NUEVA ORDEN</span>
        <h1>Una nueva visita al taller</h1>
        <p class="muted">Selecciona el vehículo y agrega los servicios que necesita.</p>
      </div>
      <a routerLink="/ordenes" class="button">Ver órdenes →</a>
    </div>
    @if (creada(); as o) {
      <section class="panel">
        <p class="success">Orden {{ o.numero }} registrada correctamente en Oracle.</p>
        <div class="detail-box">
          <h2>{{ o.numero }}</h2>
          <p>{{ o.placa }} · {{ o.clienteNombre }} · {{ o.estado }}</p>
          <table>
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Cantidad</th>
                <th>Precio</th>
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
            Total confirmado por Oracle <strong>{{ o.total | currency: 'PEN' : 'S/ ' }}</strong>
          </div>
          <button (click)="otra()">Registrar otra orden</button>
        </div>
      </section>
    } @else {
      <section class="panel form-panel">
        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }
        <form [formGroup]="form" (ngSubmit)="guardar()">
          <div class="form-grid">
            <label
              >Vehículo<select formControlName="vehiculoId">
                <option [ngValue]="null">Selecciona placa y cliente</option>
                @for (v of vehiculos(); track v.id) {
                  <option [ngValue]="v.id">{{ v.placa }} · {{ v.clienteNombre }}</option>
                }</select
              ><small class="field-error">{{ campo('vehiculoId') }}</small></label
            ><label
              >Kilometraje actual<input
                type="number"
                formControlName="kilometraje"
                min="0"
                max="9999999"
              /><small class="field-error">{{ campo('kilometraje') }}</small></label
            >
          </div>
          <div class="toolbar order-lines">
            <strong>Servicios de la visita</strong
            ><span class="muted">{{ lineas.length }} / 10</span
            ><button type="button" (click)="agregar()" [disabled]="lineas.length >= 10">
              + Agregar línea
            </button>
          </div>
          <div class="table-wrap" formArrayName="detalles">
            <table>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (g of lineas.controls; track g; let i = $index) {
                  <tr [formGroupName]="i">
                    <td>
                      <select formControlName="servicioId">
                        <option [ngValue]="null">Selecciona un servicio</option>
                        @for (s of servicios(); track s.id) {
                          <option [ngValue]="s.id" [disabled]="usado(s.id, i)">
                            {{ s.codigo }} · {{ s.nombre }}
                          </option>
                        }</select
                      ><small class="field-error">{{
                        campo('detalles[' + i + '].servicioId')
                      }}</small>
                    </td>
                    <td>
                      <input
                        aria-label="Cantidad"
                        type="number"
                        min="1"
                        max="5"
                        formControlName="cantidad"
                      /><small class="field-error">{{
                        campo('detalles[' + i + '].cantidad')
                      }}</small>
                    </td>
                    <td>{{ precio(g.value.servicioId) | currency: 'PEN' : 'S/ ' }}</td>
                    <td>
                      {{
                        precio(g.value.servicioId) * (g.value.cantidad || 0)
                          | currency: 'PEN' : 'S/ '
                      }}
                    </td>
                    <td>
                      <button
                        type="button"
                        (click)="quitar(i)"
                        [disabled]="lineas.length === 1"
                        aria-label="Quitar línea"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="total-box">
            Total estimado <strong>{{ total() | currency: 'PEN' : 'S/ ' }}</strong>
          </div>
          <p class="muted">El servidor confirma precios y total con los datos de Oracle.</p>
          <div class="form-actions">
            <button class="primary" [disabled]="form.invalid || loading()">
              {{ loading() ? 'Registrando…' : 'Registrar orden →' }}
            </button>
          </div>
        </form>
      </section>
    }`,
})
export class OrdenForm {
  private fb = inject(FormBuilder);
  private api = inject(OrdenesService);
  vehiculos = signal<Vehiculo[]>([]);
  servicios = signal<Servicio[]>([]);
  loading = signal(false);
  error = signal('');
  creada = signal<Orden | null>(null);
  campos: Record<string, string> = {};
  form = this.fb.group({
    vehiculoId: [null as number | null, Validators.required],
    kilometraje: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(9999999)],
    ],
    detalles: this.fb.array([this.linea()]),
  });
  get lineas() {
    return this.form.controls.detalles;
  }
  constructor() {
    inject(VehiculosService)
      .listar()
      .subscribe({
        next: (r) => this.vehiculos.set(r),
        error: (e) => this.error.set(e.error?.mensaje || 'No se pudieron cargar vehículos'),
      });
    inject(ServiciosService)
      .listar()
      .subscribe({
        next: (r) => this.servicios.set(r.filter((s) => s.activo)),
        error: (e) => this.error.set(e.error?.mensaje || 'No se pudieron cargar servicios'),
      });
  }
  linea() {
    return this.fb.group({
      servicioId: [null as number | null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
    });
  }
  agregar() {
    if (this.lineas.length < 10) this.lineas.push(this.linea());
  }
  quitar(i: number) {
    if (this.lineas.length > 1) this.lineas.removeAt(i);
  }
  precio(id: number | null | undefined) {
    return this.servicios().find((s) => s.id === Number(id))?.precio || 0;
  }
  usado(id: number, index: number) {
    return this.lineas.controls.some((g, i) => i !== index && Number(g.value.servicioId) === id);
  }
  total() {
    return this.lineas.controls.reduce(
      (t, g) => t + this.precio(g.value.servicioId) * (g.value.cantidad || 0),
      0,
    );
  }
  campo(n: string) {
    return this.campos[n] || '';
  }
  guardar() {
    if (this.form.invalid) return;
    this.error.set('');
    this.campos = {};
    this.loading.set(true);
    this.api.crear(this.form.getRawValue()).subscribe({
      next: (r) => {
        this.creada.set(r);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e.error?.mensaje || 'No se pudo registrar la orden');
        this.campos = e.error?.campos || {};
      },
    });
  }
  otra() {
    this.creada.set(null);
    this.form.reset();
    this.lineas.clear();
    this.agregar();
  }
}
