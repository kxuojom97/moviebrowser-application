// @ts-check
"use strict";

const API_KEY = "bf970caaa83bc0082efec1d32726ac9a";
const CONFIG_URL = "https://image.tmdb.org/t/p/";
const IMG_SIZE = "w500";
const GENRE_API = "https://api.themoviedb.org/3/genre/movie/list?api_key=" + API_KEY;
const MOVIE_API = "https://api.themoviedb.org/3/movie/";
const PROGRESS_BAR = document.querySelector(".progress");
const ERROR_DIV = document.querySelector(".alert-danger");  
const GENRES = {};
const STATE = {
    genre: "All",
    genre_id: undefined,
    filter_div: document.querySelector("#all-filter"),
    api: "https://api.themoviedb.org/3/discover/movie",
    query: undefined,
    page: 1,
    total_pages: undefined
};

function handleResponse(response) {
    if (response.ok) {
        return response.json();
    } else {
        return response.text()
            .then(function(message) {
                throw new Error(message);
            });
    }
}

function handleError(err) {
    ERROR_DIV.textContent = err.message;
    ERROR_DIV.classList.remove("d-none");
}

function renderGenres(data) {
    let dataArray = data.genres;
    let ul = document.querySelector("#genre-list");
    dataArray.map(genre => {
        GENRES[genre.id] = genre.name;
        let li = document.createElement("li");
        li.classList.add("nav-list");
        let a = document.createElement("a");
        a.classList.add("nav-link");
        a.id = genre.id;
        a.textContent = genre.name;
        li.appendChild(a);
        ul.appendChild(li);
        a.addEventListener("click", function() {
            STATE.filter_div.classList.remove("active");
            this.classList.add("active");
            STATE.genre = genre.name;
            STATE.genre_id = genre.id;
            STATE.filter_div = this;
            STATE.page = 1;
            renderState();
        });
    });
}

function renderState() {
    if (STATE.genre) {
        STATE.api = "https://api.themoviedb.org/3/discover/movie?api_key=" + API_KEY;
        if (STATE.genre != "All") {
            STATE.api += "&with_genres=" + STATE.genre_id;
        }
        STATE.api += "&page=" + STATE.page
    } else {
        STATE.api = "https://api.themoviedb.org/3/search/movie?api_key=" + API_KEY +
        "&query=" + STATE.query + "&page=" + STATE.page;
    }
    PROGRESS_BAR.classList.remove("d-none");
        fetch(STATE.api)
            .then(handleResponse)
            .then(renderResults)
            .catch(handleError)
            .then(function(){
                PROGRESS_BAR.classList.add("d-none");
            });
}

function renderResults(data) {
    STATE.total_pages = data.total_pages;
    let container = document.createElement("div");
    container.classList.add("row");
    data.results.map(movie => {
        let card = document.createElement("div");
        card.classList.add("card", "col-sm-12", "col-md-6", "col-lg-3");
        let img = document.createElement("img");
        img.classList.add("card-img", "img-fluid");
        
        img.src = movie.poster_path ? CONFIG_URL + IMG_SIZE + movie.poster_path : "../img/no_img.png";
        img.alt = movie.title;
        card.appendChild(img);

        let body = document.createElement("div");
        body.classList.add("card-block");
        card.appendChild(body);

        let title = document.createElement("h4");
        title.textContent = movie.title;
        title.classList.add("card-title");
        body.appendChild(title);

        let text = document.createElement("p");
        text.textContent = movie.overview ? movie.overview : "";
        body.appendChild(text);

        card.addEventListener("click", function() {
            fetch(MOVIE_API + movie.id + "?api_key=" + API_KEY)
                .then(handleResponse)
                .then(renderMovie)
                .catch(handleError);
        });
        container.appendChild(card);
    });
    document.querySelector("#results").textContent = "";
    document.querySelector("#results").appendChild(container);
    renderPaging();
}

function renderPaging() {
    let ul = document.createElement("ul");
    ul.classList.add("pagination", "pt-2");
    if (STATE.page > 1) {
        ul.appendChild(makePageLink("<<"));
    }
    if (STATE.page < STATE.total_pages) {
        ul.appendChild(makePageLink(">>"));
    }
    document.querySelector("#page-label").textContent = "";
    document.querySelector("#page-label").appendChild(ul);
}

function makePageLink(text) {
    let li = document.createElement("li");
    li.classList.add("page-item");
    let a = document.createElement("a");
    a.classList.add("page-link");
    a.textContent = text;
    a.addEventListener("click", function() {
        if (text === "Previous") {
            STATE.page--;
        } else {
            STATE.page++;
        }
        renderState();
    });
    li.appendChild(a);
    return li;
}


function renderMovie(movie) {
    document.querySelector("#results").textContent = "";
    document.querySelector("#page-label").textContent = "";

    let container = document.createElement("div");
    container.classList.add("pt-2");
    let card = document.createElement("div");
    card.classList.add("card");

    let back_button = document.createElement("a");
    back_button.classList.add("btn", "btn-primary", "text-white");
    back_button.id = "back-button";
    back_button.textContent = "Go back";
    back_button.addEventListener("click", function() {
        renderState();
    });
    card.appendChild(back_button);

    let img = document.createElement("img");
    img.classList.add("card-img", "img-fluid");
    img.src = movie.poster_path ? CONFIG_URL + IMG_SIZE + movie.poster_path : "../img/no_img.png";
    img.alt = movie.title;
    card.appendChild(img);

    let body = document.createElement("div");
    body.classList.add("card-block");
    card.appendChild(body);

    let title = document.createElement("h2");
    title.textContent = movie.title;
    title.classList.add("card-title");
    body.appendChild(title);

    let tagline = document.createElement("h4");
    tagline.textContent = movie.tagline ? movie.tagline : "";
    tagline.classList.add("card-title");
    body.appendChild(tagline);

    let text = document.createElement("p");
    text.textContent = movie.overview ? movie.overview : "";
    body.appendChild(text);

    if (movie.genres) {
        let genres = document.createElement("p");
        genres.textContent = "Genres: ";
        genres.textContent += movie.genres[0].name;
        for (let i = 1; i < movie.genres.length; i++) {
            genres.textContent += ", " + movie.genres[i].name;
        }
        body.appendChild(genres);
    }

    if (movie.production_companies) {
        let production_companies = document.createElement("p");
        production_companies.textContent = "Production Companies: ";
        production_companies.textContent += movie.production_companies[0].name;
        for (let i = 1; i < movie.production_companies.length; i++) {
            production_companies.textContent += ", " + movie.production_companies[i].name;
        }
        body.appendChild(production_companies);
    }

    if (movie.homepage) {
        let homepage = document.createElement("a");
        homepage.classList.add("card-link");
        homepage.textContent = "Homepage";
        homepage.href = movie.homepage;
        body.appendChild(homepage);
    }

    container.appendChild(card);
    document.querySelector("#results").appendChild(container)
}

document.querySelector("#search-form")
    .addEventListener("submit", function(evt) {
        evt.preventDefault();
        STATE.query = this.querySelector("input").value;
        STATE.genre = undefined;
        STATE.genre_id = undefined;
        STATE.page = 1;
        renderState();
    });

document.querySelector("#all-filter")
    .addEventListener("click", function() {
        STATE.filter_div.classList.remove("active");
        this.classList.add("active");
        STATE.filter_div = this;
        STATE.genre = "All";
        STATE.genre_id = undefined;
        STATE.page = 1;
        renderState();
    });

fetch(GENRE_API)
    .then(handleResponse)
    .then(renderGenres)
    .then(renderState)
    .catch(handleError);