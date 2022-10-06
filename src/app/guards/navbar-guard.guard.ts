// import { Injectable } from '@angular/core';
// import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, Scroll } from '@angular/router';
// import { Observable } from 'rxjs';
// import { filter } from 'rxjs/operators';
// import { AuthService } from '../services/auth.service';
// declare var $:any;

// @Injectable({
//   providedIn: 'root'
// })
// export class NavbarGuardGuard implements CanActivate {
//   currentRoute: any;
//   constructor(
//     private router: Router,
//     private authService: AuthService
//   ) {   this.router.events.pipe(filter(e => e instanceof Scroll)).subscribe((e: any) => {
//     const tree = this.router.parseUrl(this.router.url);
//     this.currentRoute = tree.root.children.primary.segments[0].path;
//     console.log(this.currentRoute)
//   });}

  
//   canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot){
     
//       if(this.currentRoute == 'home'){
//         console.log("activated route home")
//         $("header").addClass("home_header");
       
//       }   
//       return true;
//   }
  
// }
