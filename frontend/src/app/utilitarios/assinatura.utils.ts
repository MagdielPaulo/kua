export function formatarMoeda(valor: number): string {
  return (Number(valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(dataIso: string | null | undefined): string {
  if (!dataIso) return 'Não informado';
  const str  = dataIso.includes('T') ? dataIso : `${dataIso}T12:00:00`;
  const data = new Date(str);
  return isNaN(data.getTime()) ? 'Data inválida' : data.toLocaleDateString('pt-BR');
}

export function calcularDiasRestantes(dataFim: string): number {
  const hoje = new Date();
  const fim  = new Date(dataFim.includes('T') ? dataFim : `${dataFim}T12:00:00`);
  hoje.setHours(0, 0, 0, 0);
  fim.setHours(0, 0, 0, 0);
  return Math.ceil((fim.getTime() - hoje.getTime()) / 86_400_000);
}

const _rtf = new Intl.RelativeTimeFormat('pt-BR', { style: 'long', numeric: 'auto' });

export function formatarPrazo(dias: number): string {
  if (dias < 0)   return 'Vencido';
  if (dias === 0)  return 'Vence hoje';
  const natural = _rtf.format(dias, 'day'); // 'amanhã' ou 'em N dias'
  if (natural === 'amanhã') return 'Vence amanhã';
  return natural.replace(/^em\s+/, 'Faltam ');
}
