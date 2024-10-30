import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { PrebookFormService } from '../prebook-form.service';
import { Router, ActivatedRoute } from '@angular/router';
import { map, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
export interface UserResponse {
  success: boolean;
  users: any[];
}
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  signupForm: FormGroup;
  loginForm: FormGroup;
  stores: string[] = [
    "BATHA - 8310", "VILLAGIO - 8315", "TRAIN MALL - 8320", "KHARJ - 8325", "MALAZ - 8330",
    "SANAYA - 8335", "SHAQRA - 8340", "ARRAS - 8345", "MAJMA - 8350", "BURAIDA - 8355",
    "MINA PORT - 8415", "KHOBAR - 8420", "JUBAIL - 8425", "AL HASSA - 8430", "DABBAB - 8435",
    "BUDGET FOOD - 8485", "TUWAIQ - 9551", "EXIT16 - 9552", "MALAZ - 9553", "MAKKAH - 9651", 
    "TAIF - 9652","KHURAIS - 9555",
     "SHOLAY - 9554",
    " SHIFA - 9556"
  ];
  isLoginMode = true;
  captcha: string = '';
  enteredCaptcha: string = '';
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  isLoading = false;

  constructor(
    private fb: FormBuilder, 
    public prebookFormService: PrebookFormService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.signupForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email], [this.emailExistsValidator()]],
      store: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)], [this.phoneExistsValidator()]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      captcha: ['', Validators.required]
    });
    
    

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.generateCaptcha();
    this.route.queryParams.subscribe(params => {
      this.isLoginMode = params['mode'] === 'signup' ? false : true;
    });
  }

  emailExistsValidator(): (control: AbstractControl) => Observable<ValidationErrors | null> {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.checkExistingData('email', control.value).pipe(
        map((validationResult: ValidationErrors | null) => {
          console.log('Email validation result:', validationResult); // Debugging log
          return validationResult;
        })
      );
    };
  }
  phoneExistsValidator(): (control: AbstractControl) => Observable<ValidationErrors | null> {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.checkExistingData('phone', control.value).pipe(
        map((validationResult: ValidationErrors | null) => {
          console.log('Phone validation result:', validationResult); // Debugging log
          return validationResult;
        })
      );
    };
  }
  
  

  checkExistingData(field: 'email' | 'phone', value: string): Observable<ValidationErrors | null> {
    return this.prebookFormService.getAllUsers().pipe(
      map((response: UserResponse) => {
        if (response.success && response.users) {
          const exists = response.users.some(user => user[field] === value);
          console.log(`${field} validation result: `, exists); // Debugging log
          return exists ? { [field + 'Exists']: true } : null;
        }
        return null;
      }),
      catchError(() => of(null)) // Return no error in case of any error
    );
  }
  
  
  

  onSignup() {
    this.message = '';
    console.log('Phone errors:', this.signupForm.controls['phone'].errors);
    
    // Trigger validation messages for all controls
    if (this.signupForm.invalid) {
      // Check for specific errors on form controls
      if (this.signupForm.controls['email'].hasError('emailExists')) {
        this.showMessage('This email is already in use.', 'error');
      }
      if (this.signupForm.controls['phone'].hasError('phoneExists')) {
        this.showMessage('This phone number is already in use.', 'error');
      }
      return;
    }
  
    if (this.enteredCaptcha === this.captcha) {
      this.isLoading = true;
      this.performSignup();
    } else {
      this.showMessage('Incorrect CAPTCHA, please try again.', 'error');
      this.generateCaptcha();
      this.enteredCaptcha = '';
    }
  }
  

  private performSignup() {
    this.prebookFormService.signup(this.signupForm.value).subscribe(
      response => {
        this.showMessage('Signup successful!', 'success');
        this.signupForm.reset();
      },
      error => {
        this.showMessage('Signup failed: ' + error.error.message, 'error');
      }
    ).add(() => {
      setTimeout(() => {
        this.isLoading = false;
      }, 2000);
    });
  }

  onLogin() {
    this.message = '';
    this.prebookFormService.setLoading(true);
    
    if (this.loginForm.controls['email'].value === 'admin') {
      this.loginForm.controls['email'].clearValidators();
    } else {
      this.loginForm.controls['email'].setValidators([Validators.required, Validators.email]);
    }
    this.loginForm.controls['email'].updateValueAndValidity();

    if (this.loginForm.valid) {
      this.prebookFormService.login(this.loginForm.value).subscribe(
        response => {
          this.showMessage('Login successful!', 'success');
          setTimeout(() => {
            this.prebookFormService.setLoading(false);
            this.router.navigate(['/home']);
          }, 3000);
        },
        error => {
          this.showMessage('Login failed: ' + error.error.message, 'error');
          this.prebookFormService.setLoading(false);
        }
      );
    } else {
      this.showMessage('Please fill all fields correctly.', 'error');
      this.prebookFormService.setLoading(false);
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.message = '';
    this.enteredCaptcha = '';
    if (!this.isLoginMode) {
      this.generateCaptcha();
    }
  }

  resetSignupForm() {
    this.signupForm.reset();
    this.generateCaptcha();
    this.enteredCaptcha = '';
  }

  generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captchaString = '';
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      captchaString += chars[randomIndex];
    }
    this.captcha = captchaString;
  }

  private showMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 2000);
  }
}