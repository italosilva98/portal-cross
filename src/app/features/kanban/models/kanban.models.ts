export interface Task {
  id: string;
  title: string;
  description: string;
  priority: string,
  tasks: []

}

export interface Column {
  name: string;
  tasks: Task[];
}
