// Módulo global por si en algún momento
// dejamos de usar tantos standalone y queremos reagrupar componentes.
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
