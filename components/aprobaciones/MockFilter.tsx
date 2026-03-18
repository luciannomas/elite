'use client';
import { useEffect } from 'react';

// Oculta del DOM los items mock que ya fueron aprobados/rechazados (persitido en localStorage)
export default function MockFilter() {
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('elite_mock_status') || '{}');
    Object.entries(stored).forEach(([id]) => {
      const el = document.querySelector(`[data-mock-id="${id}"]`);
      if (el) (el as HTMLElement).style.display = 'none';
    });
  }, []);

  return null;
}
