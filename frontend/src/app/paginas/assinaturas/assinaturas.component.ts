import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssinaturaService } from '../../servicos/assinatura.service';
import { Assinatura, COR_POR_CATEGORIA, CATEGORIAS } from '../../modelos/assinatura.model';

@Component({
  selector:    'app-assinaturas',
  templateUrl: './assinaturas.component.html',
  styleUrls:   ['./assinaturas.component.css'],
})
export class AssinaturasComponent implements OnInit {

  assinaturas:    Assinatura[] = [];
  filtradas:      Assinatura[] = [];
  carregando      = true;
  mensagemErro    = '';

  filtroCategoria = 'Todas';
  filtroBusca     = '';

  readonly categorias = ['Todas', ...CATEGORIAS];

  constructor(
    private assinaturaService: AssinaturaService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.assinaturaService.listarTodas().subscribe({
      next: (dados) => {
        this.assinaturas = dados.filter(a => a.ativo);
        this.aplicarFiltro();
        this.carregando = false;
      },
      error: (e) => { this.mensagemErro = e.message; this.carregando = false; },
    });
  }

  aplicarFiltro(): void {
    const busca = this.filtroBusca.toLowerCase().trim();
    this.filtradas = this.assinaturas.filter(a => {
      const ok = this.filtroCategoria === 'Todas' || a.categoria === this.filtroCategoria;
      const match = !busca || a.nome.toLowerCase().includes(busca) || a.categoria.toLowerCase().includes(busca);
      return ok && match;
    });
  }

  get totalFiltradas(): number {
    return this.filtradas.reduce((t, a) => {
      const v = Number(a.valor) || 0;
      return t + (a.ciclo_cobranca === 'Mensal' ? v : v / 12);
    }, 0);
  }

  formatarMoeda(v: number): string {
    return (Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  }

  corCategoria(cat: string): string { return COR_POR_CATEGORIA[cat]||'#6b7280'; }

  navegarParaDetalhes(id?: number): void {
    if (id) this.router.navigate(['/assinatura', id]);
  }

  navegarParaNova(): void { this.router.navigate(['/nova-assinatura']); }
}
