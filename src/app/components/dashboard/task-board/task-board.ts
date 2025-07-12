import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

// Task interface
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date;
  createdAt: Date;
}

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-board.html',
  styleUrl: './task-board.css'
})
export class TaskBoard implements OnInit {
  title: string = 'My Tasks';
  
  // Task management
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
  
  // Add task form
  newTaskTitle: string = '';
  newTaskDate: string = new Date().toISOString().split('T')[0];

  // Sample tasks
  private sampleTasks: Task[] = [
    {
      id: '1',
      title: 'Complete Angular project',
      completed: false,
      dueDate: new Date(2025, 6, 15),
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Review code changes',
      completed: true,
      dueDate: new Date(2025, 6, 12),
      createdAt: new Date()
    },
    {
      id: '3',
      title: 'Deploy to production',
      completed: false,
      dueDate: new Date(2025, 6, 20),
      createdAt: new Date()
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Handle route parameters
    this.route.params.subscribe(params => {
      const period = params['period'];
      this.loadTasks(period);
    });

    // Initialize with sample tasks
    this.tasksSubject.next([...this.sampleTasks]);
  }

  private loadTasks(period?: string) {
    let filteredTasks = [...this.sampleTasks];
    
    if (period) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (period) {
        case 'today':
          this.title = "Today's Tasks";
          filteredTasks = this.sampleTasks.filter(task => {
            const taskDate = new Date(task.dueDate.getFullYear(), 
                                     task.dueDate.getMonth(), 
                                     task.dueDate.getDate());
            return taskDate.getTime() === today.getTime();
          });
          break;
        case 'week':
          this.title = "This Week's Tasks";
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          filteredTasks = this.sampleTasks.filter(task => 
            task.dueDate >= weekStart && task.dueDate <= weekEnd
          );
          break;
        case 'month':
          this.title = "This Month's Tasks";
          filteredTasks = this.sampleTasks.filter(task => 
            task.dueDate.getMonth() === now.getMonth() && 
            task.dueDate.getFullYear() === now.getFullYear()
          );
          break;
        default:
          this.title = 'All Tasks';
      }
    }
    
    this.tasksSubject.next(filteredTasks);
  }

  // Add new task
  addTask() {
    if (this.newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: this.newTaskTitle.trim(),
        completed: false,
        dueDate: new Date(this.newTaskDate),
        createdAt: new Date()
      };

      // Add to sample tasks
      this.sampleTasks.push(newTask);
      
      // Update current view
      const currentTasks = this.tasksSubject.getValue();
      this.tasksSubject.next([...currentTasks, newTask]);
      
      // Reset form
      this.newTaskTitle = '';
      this.newTaskDate = new Date().toISOString().split('T')[0];
    }
  }

  // Toggle task completion
  toggleTask(task: Task) {
    const currentTasks = this.tasksSubject.getValue();
    const updatedTasks = currentTasks.map(t => 
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    
    // Update sample tasks
    const sampleIndex = this.sampleTasks.findIndex(t => t.id === task.id);
    if (sampleIndex !== -1) {
      this.sampleTasks[sampleIndex].completed = !this.sampleTasks[sampleIndex].completed;
    }
    
    this.tasksSubject.next(updatedTasks);
  }

  // Delete task with confirmation
  deleteTask(task: Task) {
    const confirmed = confirm(`Are you sure you want to delete "${task.title}"?`);
    if (confirmed) {
      // Remove from sample tasks
      this.sampleTasks = this.sampleTasks.filter(t => t.id !== task.id);
      
      // Update current view
      const currentTasks = this.tasksSubject.getValue();
      const updatedTasks = currentTasks.filter(t => t.id !== task.id);
      this.tasksSubject.next(updatedTasks);
    }
  }

  // Get completed tasks count
  getCompletedCount(): number {
    return this.tasksSubject.getValue().filter(t => t.completed).length;
  }

  // Get pending tasks count
  getPendingCount(): number {
    return this.tasksSubject.getValue().filter(t => !t.completed).length;
  }

  // Get total tasks count
  getTotalCount(): number {
    return this.tasksSubject.getValue().length;
  }

  // Track by function for ngFor
  trackByFn(index: number, task: Task): string {
    return task.id;
  }
}