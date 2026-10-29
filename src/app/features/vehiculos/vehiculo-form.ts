import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VehiculosService } from '../../core/services/vehiculos.service';
import { ClientesService } from '../../core/services/clientes.service';
import { Cliente } from '../../core/models';
@Component({
  imports: [ReactiveFormsModule, RouterLink],
  template: `<div class="page-heading">
      <div>
        <span class="eyebrow">CATÁLOGO / VEHICULOS</span>
        <h1>{{ id ? 'Editar' : 'Nuevo' }} vehiculo</h1>
        <p class="muted">Completa los datos. Los cambios se guardan en Oracle.</p>
      </div>
      <a routerLink="/vehiculos" class="button">← Volver</a>
    </div>
    <section class="panel form-panel">
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }
      <form [formGroup]="form" (ngSubmit)="guardar()">
        <fieldset [disabled]="loading()">
          <div class="form-grid">
            <label
              >Placa<input type="text" formControlName="placa" /><small class="field-error">{{
                campo('placa')
              }}</small></label
            ><label
              >Marca<input type="text" formControlName="marca" /><small class="field-error">{{
                campo('marca')
              }}</small></label
            ><label
              >Modelo<input type="text" formControlName="modelo" /><small class="field-error">{{
                campo('modelo')
              }}</small></label
            ><label
              >Año<input type="number" formControlName="anio" /><small class="field-error">{{
                campo('anio')
              }}</small></label
            ><label class="full"
              >Cliente<select formControlName="clienteId">
                <option [ngValue]="null">Selecciona un cliente</option>
                @for (c of clientes(); track c.id) {
                  <option [ngValue]="c.id">{{ c.nombres }} · {{ c.documento }}</option>
                }</select
              ><small class="field-error">{{ campo('clienteId') }}</small></label
            >
          </div>
        </fieldset>
        <div class="form-actions">
          <a routerLink="/vehiculos" class="button">Cancelar</a
          ><button class="primary" [disabled]="loading() || form.invalid">
            {{ loading() ? 'Guardando…' : 'Guardar vehiculo' }}
          </button>
        </div>
      </form>
    </section>`,
})
export class VehiculoForm {
  private api = inject(VehiculosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  id = Number(this.route.snapshot.paramMap.get('id')) || null;
  loading = signal(false);
  error = signal('');
  campos: Record<string, string> = {};
  clientes = signal<Cliente[]>([]);
  form = this.fb.group({
    placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-[0-9]{3}$/)]],
    marca: ['', [Validators.required, Validators.maxLength(40)]],
    modelo: ['', [Validators.required, Validators.maxLength(40)]],
    anio: [2026, [Validators.required, Validators.min(1990), Validators.max(2027)]],
    clienteId: [null as number | null, Validators.required],
  });
  constructor() {
    inject(ClientesService)
      .listar()
      .subscribe({
        next: (r) => this.clientes.set(r),
        error: (e) => this.error.set(e.error?.mensaje || 'Error al cargar clientes'),
      });
    if (this.id) {
      this.loading.set(true);
      this.api.obtener(this.id).subscribe({
        next: (r) => {
          this.form.patchValue(r);
          this.loading.set(false);
        },
        error: (e) => {
          this.error.set(e.error?.mensaje || 'Registro no disponible');
          this.loading.set(false);
        },
      });
    }
  }
  campo(nombre: string): string {
    const c = this.form.get(nombre);
    return (
      this.campos[nombre] ||
      (c?.touched && c.invalid ? 'Revisa este campo: dato obligatorio o fuera de rango.' : '')
    );
  }
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.campos = {};
    const data = this.form.getRawValue();
    const request: import('rxjs').Observable<unknown> = this.id
      ? this.api.editar(this.id, data)
      : this.api.crear(data);
    request.subscribe({
      next: () => void this.router.navigate(['/vehiculos']),
      error: (e) => {
        this.loading.set(false);
        this.error.set(e.error?.mensaje || 'No se pudo guardar');
        this.campos = e.error?.campos || {};
      },
    });
  }
}
