import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServiciosService } from '../../core/services/servicios.service';
import { ClientesService } from '../../core/services/clientes.service';
import { Cliente } from '../../core/models';
@Component({
  imports: [ReactiveFormsModule, RouterLink],
  template: `<div class="page-heading">
      <div>
        <span class="eyebrow">CATÁLOGO / SERVICIOS</span>
        <h1>{{ id ? 'Editar' : 'Nuevo' }} servicio</h1>
        <p class="muted">Completa los datos. Los cambios se guardan en Oracle.</p>
      </div>
      <a routerLink="/servicios" class="button">← Volver</a>
    </div>
    <section class="panel form-panel">
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }
      <form [formGroup]="form" (ngSubmit)="guardar()">
        <fieldset [disabled]="loading()">
          <div class="form-grid">
            <label
              >Código<input type="text" formControlName="codigo" /><small class="field-error">{{
                campo('codigo')
              }}</small></label
            ><label
              >Nombre<input type="text" formControlName="nombre" /><small class="field-error">{{
                campo('nombre')
              }}</small></label
            ><label
              >Precio (S/)<input type="number" formControlName="precio" /><small
                class="field-error"
                >{{ campo('precio') }}</small
              ></label
            ><label
              >Duración (minutos)<input type="number" formControlName="duracionMin" /><small
                class="field-error"
                >{{ campo('duracionMin') }}</small
              ></label
            >
          </div>
        </fieldset>
        <div class="form-actions">
          <a routerLink="/servicios" class="button">Cancelar</a
          ><button class="primary" [disabled]="loading() || form.invalid">
            {{ loading() ? 'Guardando…' : 'Guardar servicio' }}
          </button>
        </div>
      </form>
    </section>`,
})
export class ServicioForm {
  private api = inject(ServiciosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  id = Number(this.route.snapshot.paramMap.get('id')) || null;
  loading = signal(false);
  error = signal('');
  campos: Record<string, string> = {};
  clientes = signal<Cliente[]>([]);
  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^SRV-[0-9]{3}$/)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    precio: [null as number | null, [Validators.required, Validators.min(0.01)]],
    duracionMin: [
      null as number | null,
      [Validators.required, Validators.min(15), Validators.max(480)],
    ],
  });
  constructor() {
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
      next: () => void this.router.navigate(['/servicios']),
      error: (e) => {
        this.loading.set(false);
        this.error.set(e.error?.mensaje || 'No se pudo guardar');
        this.campos = e.error?.campos || {};
      },
    });
  }
}
