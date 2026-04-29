import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from 'app/core/services/users';

@Component({
  selector: 'app-dashboard-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-settings.html',
  styleUrl: './dashboard-settings.css',
})
export class DashboardSettings {

  constructor(private usersService: UsersService) {
    const admin = usersService.getUserById(1);
    if (admin) {
      this.form = { name: admin.name, email: admin.email, phone: admin.phone||'', bio: admin.bio||'', avatar: admin.avatar };
    }
  }

  form = { name:'Admin HerPower', email:'admin@herpower.com', phone:'01000000000', bio:'مشرف المنصة', avatar:'https://i.pravatar.cc/150?img=10' };

  passForm = { old:'', new:'', confirm:'' };
  showOld  = false;
  showNew  = false;
  showConf = false;
  passError   = '';
  passSuccess = false;
  saved = false;

  settings = { hateSpeechFilter: true, autoSuspend: true, allowComments: true };

  // كلمة المرور الحالية (في تطبيق حقيقي من الـ backend)
  private currentPass = 'herpower123';

  saveProfile(): void {
    this.usersService.updateProfile(1, {
      name: this.form.name, email: this.form.email,
      phone: this.form.phone, bio: this.form.bio, avatar: this.form.avatar
    });
    this.saved = true;
    setTimeout(() => this.saved = false, 2500);
  }

  changePassword(): void {
    this.passError = '';
    this.passSuccess = false;
    if (!this.passForm.old) { this.passError = 'أدخل كلمة المرور الحالية'; return; }
    if (this.passForm.old !== this.currentPass) { this.passError = 'كلمة المرور الحالية غير صحيحة'; return; }
    if (this.passForm.new.length < 6) { this.passError = 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'; return; }
    if (this.passForm.new !== this.passForm.confirm) { this.passError = 'كلمة المرور غير متطابقة'; return; }
    this.currentPass = this.passForm.new;
    this.passForm    = { old:'', new:'', confirm:'' };
    this.passSuccess = true;
    setTimeout(() => this.passSuccess = false, 3000);
  }
}
