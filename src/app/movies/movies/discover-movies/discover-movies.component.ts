import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Country, CountryRepository } from 'src/app/models/countries.repository';
import { Genre, MovieGenreRepository } from 'src/app/models/genres.repository';
import { MoviesResponse } from 'src/app/models/movies.response.model';
import { DiscoverService } from 'src/app/services/discover.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'discover-movies',
  templateUrl: './discover-movies.component.html',
  styleUrls: ['./discover-movies.component.css']
})
export class DiscoverMoviesComponent implements OnInit {

  image_url: string = environment.image_url;
  isLoading: boolean = true;
  current_movies: MoviesResponse | null = null;
  current_title = "discover";
  genres: Genre[] = [];
  countries: Country[] = [];
  model: any = {
    sortby: "popularity.desc",
    category: 0,
    country: 0,
    year: 0
  };
  query: string = "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=tr-tr&page=1&sort_by=popularity.desc";
  current_page: number = 1;

  constructor(
    private discoverService: DiscoverService,
    private genreRepository: MovieGenreRepository,
    private countryRepository: CountryRepository
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
      this.genres = this.genreRepository.getGenres();
      this.countries = this.countryRepository.getCountries();
      this.discoverService.getMovies(this.query).subscribe(data => {
        this.current_movies = data;
        this.isLoading = false;
      });
  }

  GetQuery(form: NgForm) {
    let query = "https://api.themoviedb.org/3/discover/movie?"
    if (this.model.category != 0) {
      query = query + "&with_genres=" + this.model.category;
    }
    if (this.model.country != 0) {
      query = query + "&with_origin_country=" + this.model.country;
    }
    if (this.model.year != 0) {
      query = query + "&primary_release_year=" + this.model.year;
    }
    if (this.model.sortby) {
      query = query + "&sort_by=" + this.model.sortby;
    }
    if (this.model.min_vote_average) {
      query = query + "&vote_average.gte=" + this.model.min_vote_average;
    }
    if (this.model.max_vote_average) {
      query = query + "&vote_average.lte=" + this.model.max_vote_average;
    }
    if (form.valid) {
      query += "&vote_count.gte=25&language=tr-tr";
      this.query = query;
      this.LoadPage();
    }
  }

  getMoviesByCategory(category: number): void {
    let query = "https://api.themoviedb.org/3/discover/movie?"
    query = query + "&with_genres=" + category + "&vote_count.gte=200";
    query = query + "&sort_by=" + "vote_average.desc";
    query += "&language=tr-tr";
    this.query = query;
    this.current_page = 1;
    this.LoadPage();
  }

  getMoviesByYear(year: number): void {
    let query = "https://api.themoviedb.org/3/discover/movie?"
    query = query + "&primary_release_year=" + year + "&vote_count.gte=200";
    query = query + "&sort_by=" + "vote_average.desc";
    query += "&language=tr-tr";
    this.query = query;
    this.current_page = 1;
    this.LoadPage();
  }

  getMoviesByCountry(country_code: string): void {
    let query = "https://api.themoviedb.org/3/discover/movie?"
    query = query + "&with_origin_country=" + country_code + "&vote_count.gte=50";
    query = query + "&sort_by=" + "vote_average.desc";
    query += "&language=tr-tr";
    this.query = query;
    this.current_page = 1;
    this.LoadPage();
  }

  getMarvelMovies() {
    let query = "https://api.themoviedb.org/3/discover/movie?"
    query = query + "&with_companies=420||7505&sort_by=primary_release_date.desc&language=tr-tr";
    this.query = query;
    this.current_page = 1;
    this.LoadPage();
  }

  LoadPage() {
    this.query += "&page=" + this.current_page;

    this.discoverService.getMovies(this.query).subscribe(data => {
      this.current_movies = data;
    })
  }

  getYears(count?: number): number[] {
    let currentDate = new Date();
    let currentYear: number = currentDate.getFullYear();
    let Years: number[] = [];
    let minYear: number = 1910;
    if (count) {
      minYear = currentYear - count;
    }
    for (let i = currentYear; minYear < i; i--) {
      Years.push(i)
    }
    return Years;
  }

  getFloor(average: number): number {
    return Number(average.toFixed(1));
  }

  getPagesArray(): number[] {
    let result: number[] = [];
    let total: number = this.current_movies.total_pages;
    if (total > 500) {
      total = 500;
    }
    let array: number[] = [1,2,3,4, this.current_page-1, this.current_page, this.current_page+1, this.current_page+2, total-2, total-1, total]

    for (let i of array) {
      if ( !result.includes(i) && i != 0 && Math.max(...result) <= i && i < total ) {
        result.push(i);
      }
    }
    return result;
  }

  PreviousPage() {
    if (this.current_page > 1) {
      this.current_page--;
      this.LoadPage();
    }
  }

  GetPage(page: number) {
    this.current_page = page;
    this.LoadPage();
  }

  NextPage() {
    if (this.current_movies && this.current_movies.total_pages > this.current_page) {
      this.current_page++;
      this.LoadPage();
    }
  }
}
