import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  private data = Object({});
  private page = "signIn";

  constructor() { }

  ngOnInit() {
  }

  isPage(page:string) {
    return this.page === page;
  }

  setPage(page:string) {
    this.page = page;
  }
}
