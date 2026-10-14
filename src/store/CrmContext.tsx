import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import type {
  Activity,
  ActivityType,
  Client,
  CrmState,
  Deal,
  DealStage,
  EntityType,
  Task,
} from '../types';
import { crmStorage } from './storage';
import { buildSeed } from '../data/seed';
import { uid } from '../utils/format';
import { DEAL_STAGE_META } from '../utils/meta';

export type ClientInput = Omit<Client, 'id' | 'createdAt'>;
export type DealInput = Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>;
export type TaskInput = Omit<Task, 'id' | 'createdAt'>;

type Action =
  | { type: 'ADD_CLIENT'; client: Client }
  | { type: 'UPDATE_CLIENT'; id: string; patch: Partial<Omit<Client, 'id'>> }
  | { type: 'DELETE_CLIENT'; id: string }
  | { type: 'ADD_DEAL'; deal: Deal }
  | { type: 'UPDATE_DEAL'; id: string; patch: Partial<Omit<Deal, 'id'>> }
  | { type: 'MOVE_DEAL'; id: string; stage: DealStage }
  | { type: 'DELETE_DEAL'; id: string }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; id: string; patch: Partial<Omit<Task, 'id'>> }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'TOGGLE_TASK'; id: string }
  | { type: 'ADD_ACTIVITY'; activity: Activity }
  | { type: 'RESET'; state: CrmState };

function makeActivity(
  type: ActivityType,
  entityType: EntityType,
  entityId: string,
  text: string,
): Activity {
  return { id: uid('a'), type, entityType, entityId, text, createdAt: new Date().toISOString() };
}

function reducer(state: CrmState, action: Action): CrmState {
  switch (action.type) {
    case 'ADD_CLIENT':
      return {
        ...state,
        clients: [action.client, ...state.clients],
        activities: [
          makeActivity('created', 'client', action.client.id, `Клиент «${action.client.name}» добавлен`),
          ...state.activities,
        ],
      };

    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)),
      };

    case 'DELETE_CLIENT': {
      const removedDealIds = new Set(
        state.deals.filter((d) => d.clientId === action.id).map((d) => d.id),
      );
      return {
        clients: state.clients.filter((c) => c.id !== action.id),
        deals: state.deals.filter((d) => d.clientId !== action.id),
        tasks: state.tasks.filter(
          (t) => t.clientId !== action.id && !(t.dealId && removedDealIds.has(t.dealId)),
        ),
        activities: state.activities.filter(
          (a) =>
            !(a.entityType === 'client' && a.entityId === action.id) &&
            !(a.entityType === 'deal' && removedDealIds.has(a.entityId)),
        ),
      };
    }

    case 'ADD_DEAL':
      return {
        ...state,
        deals: [action.deal, ...state.deals],
        activities: [
          makeActivity('created', 'deal', action.deal.id, `Сделка «${action.deal.title}» создана`),
          ...state.activities,
        ],
      };

    case 'UPDATE_DEAL': {
      const prev = state.deals.find((d) => d.id === action.id);
      if (!prev) return state;
      const next: Deal = { ...prev, ...action.patch, updatedAt: new Date().toISOString() };
      const stageChanged = action.patch.stage && action.patch.stage !== prev.stage;
      const activities = stageChanged
        ? [
            makeActivity(
              'stage_change',
              'deal',
              next.id,
              `Сделка «${next.title}»: ${DEAL_STAGE_META[prev.stage].label} → ${DEAL_STAGE_META[next.stage].label}`,
            ),
            ...state.activities,
          ]
        : state.activities;
      return {
        ...state,
        deals: state.deals.map((d) => (d.id === action.id ? next : d)),
        activities,
      };
    }

    case 'MOVE_DEAL': {
      const deal = state.deals.find((d) => d.id === action.id);
      if (!deal || deal.stage === action.stage) return state;
      const moved: Deal = { ...deal, stage: action.stage, updatedAt: new Date().toISOString() };
      return {
        ...state,
        deals: state.deals.map((d) => (d.id === action.id ? moved : d)),
        activities: [
          makeActivity(
            'stage_change',
            'deal',
            deal.id,
            `Сделка «${deal.title}»: ${DEAL_STAGE_META[deal.stage].label} → ${DEAL_STAGE_META[action.stage].label}`,
          ),
          ...state.activities,
        ],
      };
    }

    case 'DELETE_DEAL':
      return {
        ...state,
        deals: state.deals.filter((d) => d.id !== action.id),
        tasks: state.tasks.map((t) => (t.dealId === action.id ? { ...t, dealId: null } : t)),
        activities: state.activities.filter(
          (a) => !(a.entityType === 'deal' && a.entityId === action.id),
        ),
      };

    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)),
      };

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t,
        ),
      };

    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.activity, ...state.activities] };

    case 'RESET':
      return action.state;

    default:
      return state;
  }
}

export interface CrmApi {
  state: CrmState;
  clientById: Map<string, Client>;
  dealById: Map<string, Deal>;
  addClient(data: ClientInput): Client;
  updateClient(id: string, patch: Partial<Omit<Client, 'id'>>): void;
  deleteClient(id: string): void;
  addDeal(data: DealInput): Deal;
  updateDeal(id: string, patch: Partial<Omit<Deal, 'id'>>): void;
  moveDeal(id: string, stage: DealStage): void;
  deleteDeal(id: string): void;
  addTask(data: TaskInput): Task;
  updateTask(id: string, patch: Partial<Omit<Task, 'id'>>): void;
  deleteTask(id: string): void;
  toggleTask(id: string): void;
  addActivity(input: { type: ActivityType; entityType: EntityType; entityId: string; text: string }): void;
  resetDemo(): void;
}

const CrmContext = createContext<CrmApi | null>(null);

export function CrmProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => crmStorage.load() ?? buildSeed());

  // Каждая мутация сразу сохраняется — переживёт перезагрузку страницы.
  useEffect(() => {
    crmStorage.save(state);
  }, [state]);

  const clientById = useMemo(() => new Map(state.clients.map((c) => [c.id, c])), [state.clients]);
  const dealById = useMemo(() => new Map(state.deals.map((d) => [d.id, d])), [state.deals]);

  const value = useMemo<CrmApi>(() => {
    const now = () => new Date().toISOString();
    return {
      state,
      clientById,
      dealById,
      addClient(data) {
        const client: Client = { ...data, id: uid('c'), createdAt: now() };
        dispatch({ type: 'ADD_CLIENT', client });
        return client;
      },
      updateClient(id, patch) {
        dispatch({ type: 'UPDATE_CLIENT', id, patch });
      },
      deleteClient(id) {
        dispatch({ type: 'DELETE_CLIENT', id });
      },
      addDeal(data) {
        const deal: Deal = { ...data, id: uid('d'), createdAt: now(), updatedAt: now() };
        dispatch({ type: 'ADD_DEAL', deal });
        return deal;
      },
      updateDeal(id, patch) {
        dispatch({ type: 'UPDATE_DEAL', id, patch });
      },
      moveDeal(id, stage) {
        dispatch({ type: 'MOVE_DEAL', id, stage });
      },
      deleteDeal(id) {
        dispatch({ type: 'DELETE_DEAL', id });
      },
      addTask(data) {
        const task: Task = { ...data, id: uid('t'), createdAt: now() };
        dispatch({ type: 'ADD_TASK', task });
        return task;
      },
      updateTask(id, patch) {
        dispatch({ type: 'UPDATE_TASK', id, patch });
      },
      deleteTask(id) {
        dispatch({ type: 'DELETE_TASK', id });
      },
      toggleTask(id) {
        dispatch({ type: 'TOGGLE_TASK', id });
      },
      addActivity({ type, entityType, entityId, text }) {
        dispatch({ type: 'ADD_ACTIVITY', activity: makeActivity(type, entityType, entityId, text) });
      },
      resetDemo() {
        dispatch({ type: 'RESET', state: buildSeed() });
      },
    };
  }, [state, clientById, dealById]);

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm(): CrmApi {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm должен использоваться внутри <CrmProvider>');
  return ctx;
}