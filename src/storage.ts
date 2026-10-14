import type { CrmState } from '../types';

export const STORAGE_KEY = 'portfolio_crm_v1';
const SCHEMA_VERSION = 1;

interface PersistedState {
  version: number;
  data: CrmState;
}

/**
 * Абстракция хранилища. Чтобы перевести приложение на API,
 * достаточно реализовать этот интерфейс (например, классом с fetch)
 * и подменить экспорт `crmStorage` ниже. Весь UI останется без изменений.
 */
export interface CrmStorage {
  load(): CrmState | null;
  save(state: CrmState): void;
  clear(): void;
}

class LocalStorageCrmStorage implements CrmStorage {
  load(): CrmState | null {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PersistedState;
      if (!parsed || parsed.version !== SCHEMA_VERSION || !parsed.data) return null;
      const { clients, deals, tasks, activities } = parsed.data;
      if (
        !Array.isArray(clients) ||
        !Array.isArray(deals) ||
        !Array.isArray(tasks) ||
        !Array.isArray(activities)
      ) {
        return null;
      }
      return parsed.data;
    } catch (error) {
      console.warn('Не удалось прочитать сохранённые данные, начинаем с демо-набора.', error);
      return null;
    }
  }

  save(state: CrmState): void {
    try {
      const payload: PersistedState = { version: SCHEMA_VERSION, data: state };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn('Не удалось сохранить данные в localStorage.', error);
    }
  }

  clear(): void {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export const crmStorage: CrmStorage = new LocalStorageCrmStorage();