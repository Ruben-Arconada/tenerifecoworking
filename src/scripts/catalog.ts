// Lógica de filtros del catálogo (compartida por la versión ES y EN).
// - Filtra por isla y tipo sin recargar.
// - Sincroniza el estado con la URL (?isla=...&tipo=...) para que los filtros
//   sean enlazables (footer, emails, anuncios) y sobrevivan a recargas.
export function initCatalog(): void {
  const fIsla = document.getElementById('f-isla') as HTMLSelectElement | null;
  const fTipo = document.getElementById('f-tipo') as HTMLSelectElement | null;
  const fReset = document.getElementById('f-reset');
  const items = Array.from(document.querySelectorAll<HTMLElement>('.espacio-item'));
  const count = document.getElementById('count');
  const empty = document.getElementById('empty');
  const grid = document.getElementById('grid');

  if (!fIsla || !fTipo) return;

  function apply(): void {
    const isla = fIsla!.value;
    const tipo = fTipo!.value;
    let visible = 0;
    items.forEach((item) => {
      const ok =
        (!isla || item.dataset.isla === isla) && (!tipo || item.dataset.tipo === tipo);
      item.style.display = ok ? '' : 'none';
      if (ok) visible++;
    });
    if (count) count.textContent = String(visible);
    empty?.classList.toggle('hidden', visible > 0);
    grid?.classList.toggle('hidden', visible === 0);
  }

  function syncUrl(): void {
    const p = new URLSearchParams();
    if (fIsla!.value) p.set('isla', fIsla!.value);
    if (fTipo!.value) p.set('tipo', fTipo!.value);
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : ''));
  }

  // Estado inicial desde la URL (?isla=&tipo=). Valores desconocidos se ignoran.
  const params = new URLSearchParams(location.search);
  const pIsla = params.get('isla');
  const pTipo = params.get('tipo');
  if (pIsla && Array.from(fIsla.options).some((o) => o.value === pIsla)) fIsla.value = pIsla;
  if (pTipo && Array.from(fTipo.options).some((o) => o.value === pTipo)) fTipo.value = pTipo;
  apply();

  fIsla.addEventListener('change', () => { apply(); syncUrl(); });
  fTipo.addEventListener('change', () => { apply(); syncUrl(); });
  fReset?.addEventListener('click', () => {
    fIsla.value = '';
    fTipo.value = '';
    apply();
    syncUrl();
  });
}
