export type ClientStatus = 'lead' | 'active' | 'inactive';
export type DealStage = 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type Currency = 'RUB' | 'USD' | 'EUR';
export type ActivityType = 'call' | 'meeting' | 'email' | 'note' | 'stage_change' | 'created';
export type EntityType = 'client' | 'deal';

/** Тон для бейджей и иконок-чипов (семантические цвета). */
export type Tone = 'green' | 'amber' | 'red' | 'gray' | 'blue' | 'ink';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: ClientStatus;
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  clientId: string;
  amount: number;
  currency: Currency;
  stage: DealStage;
  priority: Priority;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  clientId: string | null;
  dealId: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  entityType: EntityType;
  entityId: string;
  text: string;
  createdAt: string;
}

export interface CrmState {
  clients: Client[];
  deals: Deal[];
  tasks: Task[];
  activities: Activity[];
}