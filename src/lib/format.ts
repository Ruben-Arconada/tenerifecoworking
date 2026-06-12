// Formato de precio orientativo para los espacios.
const PERIODO_LABEL: Record<string, string> = {
  mes: '/mes',
  dia: '/día',
  hora: '/hora',
};

export function formatPrecio(
  precio?: number,
  periodo: string = 'mes',
  desde: boolean = true,
): string {
  if (precio == null) return 'Consultar precio';
  const n = new Intl.NumberFormat('es-ES').format(precio);
  const suf = PERIODO_LABEL[periodo] ?? '';
  return `${desde ? 'Desde ' : ''}${n} €${suf}`;
}
