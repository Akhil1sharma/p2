import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from './task-interface';
import { TaskList } from './task-list/task-list';
import { AddTaskBar } from './add-task-bar/add-task-bar';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, TaskList, AddTaskBar],
  templateUrl: './task-board.html',
  styleUrl: './task-board.css'
})
export class TaskBoard implements OnInit {
  title: string = 'My Tasks';
  

  private allTasksSubject = new BehaviorSubject<Task[]>([]);
  private filteredTasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$: Observable<Task[]> = this.filteredTasksSubject.asObservable();
  
  currentPeriod: string = '';
  
  
  private readonly STORAGE_KEY = 'task-board-data';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
   
    this.loadTasksFromStorage();
    
   
    this.route.params.subscribe(params => {
      const period = params['period'] || '';
      this.currentPeriod = period;
      this.filterTasks(period);
    });
  }
  private loadTasksFromStorage() {
    try {
      const storedTasks = sessionStorage.getItem(this.STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        
        const tasks = parsedTasks.map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt)
        }));
        this.allTasksSubject.next(tasks);
      } else {
        
        this.allTasksSubject.next([]);
      }
    } catch (error) {
      console.error('Error loading tasks from storage:', error);
      
      this.allTasksSubject.next([]);
    }
  }
  private saveTasksToStorage() {
    try {
      const tasks = this.allTasksSubject.getValue();
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to storage:', error);
    }
  }

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

  
  onTaskAdded(newTask: Task) {
    
    const currentTasks = this.allTasksSubject.getValue();
    const updatedTasks = [...currentTasks, newTask];
    this.allTasksSubject.next(updatedTasks);
    
    this.saveTasksToStorage();
    
    this.filterTasks(this.currentPeriod);
  }
  onToggleTask(task: Task) {
    const allTasks = this.allTasksSubject.getValue();
    const updatedTasks = allTasks.map(t => 
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    
    this.allTasksSubject.next(updatedTasks);
    this.saveTasksToStorage();
    
    
    this.filterTasks(this.currentPeriod);
  }
  onDeleteTask(task: Task) {
    const allTasks = this.allTasksSubject.getValue();
    const updatedTasks = allTasks.filter(t => t.id !== task.id);
    
    this.allTasksSubject.next(updatedTasks);
    this.saveTasksToStorage();
    
    
    this.filterTasks(this.currentPeriod);
  }

  clearAllTasks() {
    const confirmed = confirm('Are you sure you want to delete all tasks? This action cannot be undone.');
    if (confirmed) {
      this.allTasksSubject.next([]);
      this.saveTasksToStorage();
      this.filterTasks(this.currentPeriod);
    }
  }
  getCompletedCount(): number {
    return this.filteredTasksSubject.getValue().filter(t => t.completed).length;
  }

  getPendingCount(): number {
    return this.filteredTasksSubject.getValue().filter(t => !t.completed).length;
  }

  getTotalCount(): number {
    return this.filteredTasksSubject.getValue().length;
  }

  getAllTasksCount(): number {
    return this.allTasksSubject.getValue().length;
  }

  getCurrentTasks(): Task[] {
    return this.filteredTasksSubject.getValue();
  }
}