import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-barra-anuncios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barra-anuncios.component.html',
  styleUrls: ['./barra-anuncios.component.scss']
})
export class BarraAnunciosComponent {
  private readonly mensajeDemo = "Bienvenido a la demo web de La Malda'";
  anuncios: string[] = Array.from(
    { length: 36 },
    () => this.mensajeDemo
  );

  get bucle(): string[] {

    return [...this.anuncios, ...this.anuncios];
  }

  actualizarMensajes(mensajes: string[]): void {
    const base = mensajes.length ? mensajes : [this.mensajeDemo];
    this.anuncios = Array.from({ length: 36 }, (_, i) => base[i % base.length]);
  }
}
