import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-user-template',
  templateUrl: './user-template.component.html',
  styleUrls: ['./user-template.component.scss']
})
export class UserTemplateComponent implements OnInit {

  public userImage: string = 'assets/images/user.png';
  public userName: string = 'Individual';
  public userEmail: string;
  openedSidebar = true;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {

    // Toggle the side navigation
    $("#sidebarToggle").on("click", function (e) {
      e.preventDefault();
      $("body").toggleClass("sidenav-toggled");
    });

  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  log(state) {
    console.log(state);
  }
}
