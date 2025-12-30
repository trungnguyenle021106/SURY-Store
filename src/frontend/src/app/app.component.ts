import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerService } from './core/services/customer.service';
import { UserAddress, Ward } from './core/models/user.model';
import { AuthService } from './core/services/auth.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html', 
  styleUrl: './app.component.scss',     
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  
}
