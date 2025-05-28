import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth/auth.service';
import {NgStyle} from '@angular/common';
import {Router} from '@angular/router';


@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    NgStyle,
  ],
  templateUrl: './auth.component.html',
  standalone: true,
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit {

  backImage: string = '';
  playAnimation: boolean = false;

  form: FormGroup;
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {

    this.form = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });


    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

  }


  success: boolean = false
  error: string = ''

  register() {
    if (this.form.valid) {

      this.authService.register(this.form.value).subscribe((res) => {
        if (res.message === 'User created') {
          this.success = true
          this.error = ''
        }

        if (res.error === 'already exists') {
          this.error = res.error
          this.success = false
        }
      })
    }
  }


  loginError: boolean = false

  login() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe((res) => {


        if (res.message !== 'invalid credentials') {
          localStorage.setItem('JWT', JSON.stringify(res))
          this.loginError = false
          this.navigateToMain()
        } else {
          this.loginError = true
        }

      })
    }
  }


  ngOnInit() {
    this.setBackgroundImage();
  }


  setBackgroundImage() {
    const storedImage = sessionStorage.getItem('authBackground');
    if (storedImage) {
      this.backImage = storedImage;
      this.playAnimation = false;
    } else {
      const images = [
         'ann.jpg',  'hifumi.PNG',
        'joker.jpg', 'makoto.jpg', 'mona.png', 'ryuji.jpg'
      ];
      const randomIndex = Math.floor(Math.random() * images.length);
      this.backImage = `assets/images/authPage/${images[randomIndex]}`;
      sessionStorage.setItem('authBackground', this.backImage);
      this.playAnimation = true;
    }
  }


  showLogin: boolean = false
  showRegister: boolean = false


  showForm(formToShow: string) {
    if (formToShow === "login") {
      this.showLogin = true
      this.showRegister = false
    } else if (formToShow === "register") {
      this.showLogin = false
      this.showRegister = true
    }
  }


  navigateToMain() {
    this.router.navigateByUrl('main')
  }

  getImageStyle() {
    if (this.backImage === 'assets/images/authPage/hifumi.PNG') {
      return { left: '-315px' };
    } else if (this.backImage === 'assets/images/authPage/ann.jpg') {
      return { left: '-305px' };
    } else {
      return {};
    }
  }
}
