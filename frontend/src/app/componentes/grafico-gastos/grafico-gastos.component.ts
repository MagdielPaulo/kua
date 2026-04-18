import {
  Component, Input, OnChanges, SimpleChanges,
  ViewChild, ElementRef, AfterViewInit, OnDestroy, NgZone,
} from '@angular/core';
import * as THREE from 'three';

import { Assinatura } from '../../modelos/assinatura.model';
import { COR_POR_CATEGORIA, getLogoUrl, getAvatarGradient } from '../../modelos/assinatura.dados';

const PALETA: Record<string, string> = {
  'Streaming':               '#a855f7',
  'Inteligência Artificial': '#22d3ee',
  'Educação e Idiomas':      '#10b981',
  'Softwares/Ferramentas':   '#f59e0b',
  'Jogos':                   '#ef4444',
  'Saúde e Bem-estar':       '#ec4899',
  'Finanças':                '#14b8a6',
  'Outros':                  '#6b7280',
};

@Component({
  selector:    'app-grafico-gastos',
  templateUrl: './grafico-gastos.component.html',
  styleUrls:   ['./grafico-gastos.component.css'],
})
export class GraficoGastosComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() gastosPorCategoria: { [categoria: string]: number } = {};
  @Input() assinaturas: Assinatura[] = [];

  @ViewChild('canvas3dPie') canvasRef!: ElementRef<HTMLCanvasElement>;

  segmentoAtivo: string | null = null;
  legendaEntradas: { label: string; cor: string; valor: number; pct: string }[] = [];

  private renderer: THREE.WebGLRenderer | null = null;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private pieGroup!: THREE.Group;
  private sliceMeshes: THREE.Mesh[] = [];
  private sliceMeta: { categoria: string }[] = [];
  private raycaster = new THREE.Raycaster();
  private mouse     = new THREE.Vector2();
  private animId: number | null = null;
  private entradaT  = 0;
  private pausarRot = false;

  constructor(private ngZone: NgZone) {}

  get assinaturasDaCategoria(): Assinatura[] {
    if (!this.segmentoAtivo) return [];
    return this.assinaturas.filter(a => a.categoria === this.segmentoAtivo && a.ativo);
  }

  get percentualCategoria(): string {
    if (!this.segmentoAtivo) return '0';
    const total = Object.values(this.gastosPorCategoria).reduce((a, b) => a + b, 0);
    const val   = this.gastosPorCategoria[this.segmentoAtivo] || 0;
    return total > 0 ? ((val / total) * 100).toFixed(1) : '0';
  }

  get totalMensal(): string {
    const t = Object.values(this.gastosPorCategoria).reduce((a, b) => a + (Number(b) || 0), 0);
    return t.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  get temDados(): boolean {
    return Object.keys(this.gastosPorCategoria).length > 0;
  }

  get quantidadeCategorias(): number {
    return Object.keys(this.gastosPorCategoria).length;
  }

  ngAfterViewInit(): void {
    if (this.temDados && this.canvasRef) {
      this.inicializarCena();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['gastosPorCategoria'] || changes['gastosPorCategoria'].firstChange) return;
    this.ngZone.run(() => { this.segmentoAtivo = null; });
    if (this.renderer) {
      this.reconstruirSlices();
    } else if (this.temDados) {
      setTimeout(() => { if (this.canvasRef) this.inicializarCena(); });
    }
  }

  ngOnDestroy(): void {
    if (this.animId !== null) cancelAnimationFrame(this.animId);
    this.renderer?.dispose();
  }

  fecharDetalhe(): void {
    this.selecionarSegmento(null);
  }

  selecionarSegmento(cat: string | null): void {
    this.segmentoAtivo = cat;
    this.pausarRot     = cat !== null;
    this.atualizarSlices();
  }

  aoClicarCanvas(event: MouseEvent): void {
    if (!this.renderer || !this.sliceMeshes.length) return;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouse.x =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.sliceMeshes);
    this.ngZone.run(() => {
      if (hits.length > 0) {
        const idx = this.sliceMeshes.indexOf(hits[0].object as THREE.Mesh);
        if (idx >= 0) {
          const cat = this.sliceMeta[idx].categoria;
          this.selecionarSegmento(this.segmentoAtivo === cat ? null : cat);
        }
      } else {
        this.selecionarSegmento(null);
      }
    });
  }

  valorMensal(a: Assinatura): number {
    const v = Number(a.valor) || 0;
    return a.ciclo_cobranca === 'Mensal' ? v : v / 12;
  }

  formatarMoeda(v: number): string {
    return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  logoUrl(nome: string): string { return getLogoUrl(nome); }
  logoErro(img: HTMLImageElement): void { img.style.display = 'none'; }
  corSegmento(cat: string): string { return PALETA[cat] ?? COR_POR_CATEGORIA[cat] ?? '#6b7280'; }
  readonly getAvatarGradient = getAvatarGradient;

  private inicializarCena(): void {
    const el = this.canvasRef.nativeElement;
    const w  = el.clientWidth  || 360;
    const h  = el.clientHeight || 280;

    this.scene    = new THREE.Scene();
    this.pieGroup = new THREE.Group();
    this.scene.add(this.pieGroup);

    this.camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    this.camera.position.set(0, 2.6, 3.2);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0x000000, 0);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(3, 5, 4);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x6699ff, 0.3);
    fill.position.set(-3, 1, -2);
    this.scene.add(fill);

    this.construirSlices();
    this.iniciarLoop();
  }

  private construirSlices(): void {
    this.sliceMeshes.forEach(m => {
      this.pieGroup.remove(m);
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
    this.sliceMeshes = [];
    this.sliceMeta   = [];

    const cats  = Object.keys(this.gastosPorCategoria);
    const vals  = cats.map(c => Number(this.gastosPorCategoria[c]) || 0);
    const total = vals.reduce((a, b) => a + b, 0);
    if (total <= 0) return;

    this.legendaEntradas = cats.map((cat, i) => ({
      label: cat,
      cor:   PALETA[cat] ?? COR_POR_CATEGORIA[cat] ?? '#6b7280',
      valor: vals[i],
      pct:   ((vals[i] / total) * 100).toFixed(1),
    }));

    const GAP = 0.025;
    let   ang = 0;

    cats.forEach((cat, i) => {
      const fraction = vals[i] / total;
      const span     = fraction * Math.PI * 2;
      const mid      = ang + span / 2;

      const geo = new THREE.CylinderGeometry(
        1, 1, 0.3, 80, 1, false,
        ang + GAP / 2,
        Math.max(0.01, span - GAP),
      );

      const cor = new THREE.Color(PALETA[cat] ?? COR_POR_CATEGORIA[cat] ?? '#6b7280');
      const mat = new THREE.MeshPhongMaterial({
        color:             cor,
        emissive:          cor,
        emissiveIntensity: 0.18,
        shininess:         65,
        specular:          new THREE.Color('#aaaaaa'),
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = {
        categoria: cat,
        popOffset: new THREE.Vector3(
          Math.cos(mid) * 0.22,
          0,
          Math.sin(mid) * 0.22,
        ),
      };

      this.pieGroup.add(mesh);
      this.sliceMeshes.push(mesh);
      this.sliceMeta.push({ categoria: cat });

      ang += span;
    });

    this.entradaT = 0;
  }

  private reconstruirSlices(): void {
    this.construirSlices();
    this.atualizarSlices();
  }

  private atualizarSlices(): void {
    this.sliceMeshes.forEach(mesh => {
      const isActive = mesh.userData['categoria'] === this.segmentoAtivo;
      const pop      = mesh.userData['popOffset'] as THREE.Vector3;
      mesh.position.copy(isActive ? pop : new THREE.Vector3());
      (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = isActive ? 0.5 : 0.18;
    });
  }

  private iniciarLoop(): void {
    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        this.animId = requestAnimationFrame(loop);

        if (this.entradaT < 1) {
          this.entradaT = Math.min(1, this.entradaT + 0.022);
          this.pieGroup.scale.y = 1 - Math.pow(1 - this.entradaT, 3);
        }

        if (!this.pausarRot) {
          this.pieGroup.rotation.y += 0.004;
        }

        this.renderer!.render(this.scene, this.camera);
      };
      loop();
    });
  }
}
