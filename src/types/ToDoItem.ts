export interface ToDoItem {
    id: string;
    task: string;
    isCompleted: boolean;
    addedBy?: {
        username: string;
    };
}
