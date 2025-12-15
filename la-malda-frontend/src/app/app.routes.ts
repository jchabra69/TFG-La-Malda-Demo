import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home-component').then(m => m.HomeComponent)
  },
  {

    //Rutas del admin
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/admin-estructura-general/admin-estructura-general.component')
        .then(m => m.AdminEstructuraGeneralComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/admin/panel/panel.component')
            .then(m => m.PanelComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/admin/usuarios/lista-usuarios/lista-usuarios.component')
            .then(m => m.ListaUsuariosComponent)
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./pages/admin/productos/lista-productos/lista-productos.component')
            .then(m => m.ListaProductosComponent)
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./pages/admin/categorias/lista-categorias/lista-categorias.component')
            .then(m => m.ListaCategoriasComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./pages/admin/pedidos/lista-pedidos.component')
            .then(m => m.ListaPedidosComponent)
      }
    ]
  },

  //Rutas de la tienda ahora
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./pages/tienda/catalogo/catalogo.component')
        .then(m => m.CatalogoComponent)
  },
  {
    path: 'producto/:slug',
    loadComponent: () =>
      import('./pages/tienda/detalle-producto/detalle-producto.component')
        .then(m => m.DetalleProductoComponent)
  },
  {
    path: 'categoria/:slug',
    loadComponent: () =>
      import('./pages/tienda/categoria/categoria.component')
        .then(m => m.CategoriaComponent)
  },
  {
    path: 'carrito',
    loadComponent: () =>
      import('./pages/tienda/carrito/carrito.component')
        .then(m => m.CarritoComponent)
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/tienda/checkout/checkout.component')
        .then(m => m.CheckoutComponent)
  },
  {
    path: 'mi-perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/usuario/mi-perfil/mi-perfil.component')
        .then(m => m.MiPerfilComponent)
  },
  {
    path: 'perfil',
    redirectTo: 'mi-perfil'
  },

  {
    path: '**',
    redirectTo: ''
  }
];
