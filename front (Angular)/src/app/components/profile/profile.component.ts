import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { PublicFunctionsService } from '../../services/public-functions.service';
import { UserService } from '../../services/user/user.service';
import { imageBaseUrl } from '../../configs/urls';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports:[ImageCropperComponent]
})
export class ProfileComponent implements OnInit {
  user: any;
  imgUrl: string = imageBaseUrl;
  editing: boolean = false;
  showCropper: boolean = false;
  imageChangedEvent: any = '';
  croppedImage: SafeUrl = '';
  croppedImageBlob: Blob | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('usernameEl') usernameEl!: ElementRef;
  @ViewChild('firstNameEl') firstNameEl!: ElementRef;
  @ViewChild('lastNameEl') lastNameEl!: ElementRef;
  @ViewChild('bioEl') bioEl!: ElementRef;

  @Input() id!: number;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private functions: PublicFunctionsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    this.authService.getUser().subscribe((res) => {
      this.user = res;
    });
  }

  splitFullName(fullName: string): { firstName: string, lastName: string } {
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
    };
  }

  closeProfile() {
    this.functions.changeRoute('main');
  }

  toggleEdit() {
    this.editing = !this.editing;
  }

  saveChanges() {
    const body = {
      username: this.usernameEl.nativeElement.innerText.trim(),
      full_name: this.firstNameEl.nativeElement.innerText.trim() + ' ' + this.lastNameEl.nativeElement.innerText.trim(),
      bio: this.bioEl.nativeElement.innerText.trim()
    };

    this.userService.updateUser(body).subscribe(() => {
      this.editing = false;
      alert('Update successful');
    });
  }

  // File input trigger
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  // File selected event for image upload
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // Show cropper modal
      this.imageChangedEvent = event;
      this.showCropper = true;
    }
  }

  // When image cropping is done
  imageCropped(event: any) {
    if (event.blob) {
      // Store the Blob for uploading
      this.croppedImageBlob = event.blob;
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    } else {
      console.error('Image Cropping failed: Blob is null or undefined');
    }
  }




  // Upload cropped image
  uploadCroppedImage() {
    if (this.croppedImageBlob) {
      const formData = new FormData();
      formData.append('profile_picture', this.croppedImageBlob, 'profile_picture.png');


      this.userService.uploadProfileImage(formData).subscribe({
        next: (response) => {
          this.getUser();
          this.showCropper = false
        },
        error: (error) => {
          console.error('Upload error:', error);
        }
      });
    } else {
      console.error('No cropped image to upload');
    }
  }


  cancelCrop() {
    this.showCropper = false;
    this.croppedImage = '';
    this.imageChangedEvent = '';
  }
}
