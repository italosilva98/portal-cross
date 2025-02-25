export interface Task {
  id: string;
  title: string;
  description: string;
}

export interface Column {
  name: string;
  tasks: Task[];
}
