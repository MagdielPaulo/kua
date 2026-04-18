import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { AssinaturaService } from '../../servicos/assinatura.service';
import { Assinatura }        from '../../modelos/assinatura.model';
import { CATEGORIAS, COR_POR_CATEGORIA } from '../../modelos/assinatura.dados';
import { formatarMoeda }     from '../../utilitarios/assinatura.utils';

@Component({
  selector:    'app-assinaturas',
  templateUrl: './assinaturas.component.html',
  styleUrls:   ['./assinaturas.component.css'],
})
export class AssinaturasComponent implements OnInit {

  assinaturas: Assinatura[] = [];
  filtradas:   Assinatura[] = [];
  carregando   = true;
  mensagemErro = '';

  filtroCategoria = 'Todas';
  filtroBusca     = '';

  readonly categorias = ['Todas', ...CATEGORIAS];

  constructor(
    private assinaturaService: AssinaturaService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.assinaturaService.listarTodas().subscribe({
      next: dados => {
        this.assinaturas = dados.filter(a => a.ativo);
        this.aplicarFiltro();
        this.carregando = false;
      },
      error: e => { this.mensagemErro = e.message; this.carregando = false; },
    });
  }

  aplicarFiltro(): void {
    const busca = this.filtroBusca.toLowerCase().trim();
    this.filtradas = this.assinaturas.filter(a => {
      const categoriaOk = this.filtroCategoria === 'Todas' || a.categoria === this.filtroCategoria;
      const buscaOk     = !busca || a.nome.toLowerCase().includes(busca) || a.categoria.toLowerCase().includes(busca);
      return categoriaOk && buscaOk;
    });
  }

  get totalMensalFiltrado(): number {
    return this.filtradas.reduce((total, a) => {
      const v = Number(a.valor) || 0;
      return total + (a.ciclo_cobranca === 'Mensal' ? v : v / 12);
    }, 0);
  }

  corCategoria(cat: string): string { return COR_POR_CATEGORIA[cat] ?? '#6b7280'; }
  formatarMoeda = formatarMoeda;

  navegarParaDetalhes(id?: number): void { if (id) this.router.navigate(['/assinatura', id]); }
  navegarParaNova(): void { this.router.navigate(['/nova-assinatura']); }
}
