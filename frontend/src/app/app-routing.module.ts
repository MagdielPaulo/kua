import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent }          from './paginas/dashboard/dashboard.component';
import { AssinaturasComponent }        from './paginas/assinaturas/assinaturas.component';
import { NovaAssinaturaComponent }     from './paginas/nova-assinatura/nova-assinatura.component';
import { DetalhesAssinaturaComponent } from './paginas/detalhes-assinatura/detalhes-assinatura.component';
import { PagamentosComponent }         from './paginas/pagamentos/pagamentos.component';
import { RelatoriosComponent }         from './paginas/relatorios/relatorios.component';
import { ConfiguracoesComponent }      from './paginas/configuracoes/configuracoes.component';

const rotas: Routes = [
  { path: '',                redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',       component: DashboardComponent },
  { path: 'assinaturas',     component: AssinaturasComponent },
  { path: 'nova-assinatura', component: NovaAssinaturaComponent },
  { path: 'assinatura/:id',  component: DetalhesAssinaturaComponent },
  { path: 'pagamentos',      component: PagamentosComponent },
  { path: 'relatorios',      component: RelatoriosComponent },
  { path: 'configuracoes',   component: ConfiguracoesComponent },
  { path: '**',              redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(rotas)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
