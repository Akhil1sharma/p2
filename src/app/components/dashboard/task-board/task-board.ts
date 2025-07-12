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
  private allTasksSubject = new BehaviorSubject<Task[]>([]);
  private filteredTasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$: Observable<Task[]> = this.filteredTasksSubject.asObservable();
  
  // Add task form
  newTaskTitle: string = '';
  newTaskDate: string = new Date().toISOString().split('T')[0];
  
  // Current filter period
  private currentPeriod: string = '';
  
  // Helper property for template
  get todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Storage key for session persistence
  private readonly STORAGE_KEY = 'task-board-data';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Load tasks from session storage first
    this.loadTasksFromStorage();
    
    // Handle route parameters
    this.route.params.subscribe(params => {
      const period = params['period'] || '';
      this.currentPeriod = period;
      this.filterTasks(period);
    });
  }

  // Load tasks from session storage
  private loadTasksFromStorage() {
    try {
      const storedTasks = sessionStorage.getItem(this.STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        // Convert date strings back to Date objects
        const tasks = parsedTasks.map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt)
        }));
        this.allTasksSubject.next(tasks);
      } else {
        // Start with empty list - no sample data
        this.allTasksSubject.next([]);
      }
    } catch (error) {
      console.error('Error loading tasks from storage:', error);
      // Start with empty list even on error
      this.allTasksSubject.next([]);
    }
  }

  // Initialize with sample data (only on first visit)
  private initializeSampleData() {
    const sampleTasks: Task[] = [
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
    
    this.allTasksSubject.next(sampleTasks);
    this.saveTasksToStorage();
  }

  // Save tasks to session storage
  private saveTasksToStorage() {
    try {
      const tasks = this.allTasksSubject.getValue();
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to storage:', error);
    }
  }

  // Filter tasks based on period
  private filterTasks(period: string) {
    const allTasks = this.allTasksSubject.getValue();
    let filteredTasks = [...allTasks];
    
    if (period) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (period) {
        case 'today':
          this.title = "Today's Tasks";
          filteredTasks = allTasks.filter(task => {
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
          
          filteredTasks = allTasks.filter(task => 
            task.dueDate >= weekStart && task.dueDate <= weekEnd
          );
          break;
        case 'month':
          this.title = "This Month's Tasks";
          filteredTasks = allTasks.filter(task => 
            task.dueDate.getMonth() === now.getMonth() && 
            task.dueDate.getFullYear() === now.getFullYear()
          );
          break;
        default:
          this.title = 'All Tasks';
      }
    } else {
      this.title = 'My Tasks';
    }
    
    this.filteredTasksSubject.next(filteredTasks);
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

      // Add to all tasks
      const currentTasks = this.allTasksSubject.getValue();
      const updatedTasks = [...currentTasks, newTask];
      this.allTasksSubject.next(updatedTasks);
      
      // Save to storage
      this.saveTasksToStorage();
      
      // Reapply current filter
      this.filterTasks(this.currentPeriod);
      
      // Reset form
      this.newTaskTitle = '';
      this.newTaskDate = new Date().toISOString().split('T')[0];
    }
  }

  // Toggle task completion
  toggleTask(task: Task) {
    const allTasks = this.allTasksSubject.getValue();
    const updatedTasks = allTasks.map(t => 
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    
    this.allTasksSubject.next(updatedTasks);
    this.saveTasksToStorage();
    
    // Reapply current filter
    this.filterTasks(this.currentPeriod);
  }

  // Delete task with confirmation
  deleteTask(task: Task) {
    const confirmed = confirm(`Are you sure you want to delete "${task.title}"?`);
    if (confirmed) {
      const allTasks = this.allTasksSubject.getValue();
      const updatedTasks = allTasks.filter(t => t.id !== task.id);
      
      this.allTasksSubject.next(updatedTasks);
      this.saveTasksToStorage();
      
      // Reapply current filter
      this.filterTasks(this.currentPeriod);
    }
  }

  // Clear all tasks
  clearAllTasks() {
    const confirmed = confirm('Are you sure you want to delete all tasks? This action cannot be undone.');
    if (confirmed) {
      this.allTasksSubject.next([]);
      this.saveTasksToStorage();
      this.filterTasks(this.currentPeriod);
    }
  }

  // Reset to sample data (for demo purposes)
  loadSampleData() {
    const confirmed = confirm('This will add sample tasks to your current list. Are you sure?');
    if (confirmed) {
      const sampleTasks: Task[] = [
        {
          id: 'sample-1',
          title: 'Complete Angular project',
          completed: false,
          dueDate: new Date(2025, 6, 15),
          createdAt: new Date()
        },
        {
          id: 'sample-2',
          title: 'Review code changes',
          completed: true,
          dueDate: new Date(2025, 6, 12),
          createdAt: new Date()
        },
        {
          id: 'sample-3',
          title: 'Deploy to production',
          completed: false,
          dueDate: new Date(2025, 6, 20),
          createdAt: new Date()
        }
      ];
      
      // Add sample tasks to existing tasks
      const currentTasks = this.allTasksSubject.getValue();
      const updatedTasks = [...currentTasks, ...sampleTasks];
      this.allTasksSubject.next(updatedTasks);
      this.saveTasksToStorage();
      this.filterTasks(this.currentPeriod);
    }
  }

  // Get completed tasks count
  getCompletedCount(): number {
    return this.filteredTasksSubject.getValue().filter(t => t.completed).length;
  }

  // Get pending tasks count
  getPendingCount(): number {
    return this.filteredTasksSubject.getValue().filter(t => !t.completed).length;
  }

  // Get total tasks count
  getTotalCount(): number {
    return this.filteredTasksSubject.getValue().length;
  }

  // Get all tasks count (for overall statistics)
  getAllTasksCount(): number {
    return this.allTasksSubject.getValue().length;
  }

  // Track by function for ngFor
  trackByFn(index: number, task: Task): string {
    return task.id;
  }
}