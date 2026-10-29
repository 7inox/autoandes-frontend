import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  imports: [RouterLink],
  template: `<section class="empty-page">
    <span class="eyebrow">AUTOANDES / 404</span>
    <h1>Página no encontrada</h1>
    <p>La dirección que buscas no existe en AutoAndes.</p>
    <a class="button primary" routerLink="/servicios">Volver a servicios</a>
  </section>`,
})
export class NoEncontrado {}
