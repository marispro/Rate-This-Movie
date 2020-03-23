import React from 'react';
import {BrowserRouter as Router, Switch, Route, Link} from "react-router-dom";

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			rates: ['', 1, 2, 3, 4, 5],
			results: [],
			activeMovie: null,
			ratedMovies: JSON.parse(localStorage.getItem('movieRates')) || []
		}
	}

	SearchForMovies = (event) => {
		let currentState = this;
		let value = event.target.value;
		if (value.length > 2) {
			fetch(`http://www.omdbapi.com/?apikey=9ea7ccb8&s=${value}`)
				.then(response => response.json())
				.then(function (response) {
					if (response.Response === 'True') {
						currentState.setState({
							results: response.Search
						})
					}
				})
		}
	};

	setMovieRate(index, e) {
		const movie = this.state.results[index];
		movie.Rate = e.target.value;

		let ratedMovies = this.state.ratedMovies;
		ratedMovies[movie.imdbID] = movie;

		if (!movie.Rate) delete ratedMovies[movie.imdbID];

		this.setState({
			ratedMovies: ratedMovies
		});

		// setting local storage
		let movieRatesItems = JSON.parse(localStorage.getItem('movieRates'));
		if (movieRatesItems == null) movieRatesItems = {};
		movieRatesItems[movie.imdbID] = movie;
		if (!movie.Rate) delete movieRatesItems[movie.imdbID];
		localStorage.setItem('movieRates', JSON.stringify(movieRatesItems))
	};

	getMovieRate(imdbID) {
		let rate = '';
		const ratedMovies = this.state.ratedMovies;
		for (let item in ratedMovies) {
			if (ratedMovies.hasOwnProperty(item)) {
				if (ratedMovies[item].imdbID === imdbID) return ratedMovies[item].Rate
			}

		}
		return rate;
	};

	compareBy(key) {
		return function (a, b) {
			if (a[key] < b[key]) return 1;
			if (a[key] > b[key]) return -1;
			return 0;
		};
	};

	sortBy(stateName, data, key) {
		let sortable = [];
		for (const item in data) {
			sortable.push(data[item]);
		}
		sortable.sort(this.compareBy(key));

		this.setState({
			[stateName]: sortable
		});
	};

	Home = () => {
		return (
			<div>
				<label htmlFor="searchInput">Search for movie:</label>
				<br/>
				<input type="text" placeholder="Start typing.." id="searchInput"
				       onChange={this.SearchForMovies}
				/>
				<table id="results">
					<thead>
					<tr>
						<th>Poster</th>
						<th>Title</th>
						<th>Rate</th>
					</tr>
					</thead>
					<tbody>
					<tr style={{display: (this.state.results.length ? 'none' : 'table-cell')}}>
						<td colSpan="3">
							No results
						</td>
					</tr>
					{Object.keys(this.state.results).map((result, index) =>
						<tr key={index}>
							<td>
								<img src={this.state.results[result].Poster} alt="" className="poster"/>
							</td>
							<td>
								<div className="clickable"
								     onClick={() => this.setState({activeMovie: this.state.results[result].imdbID})}>
									{this.state.results[result].Title}
								</div>
								<div className="details"
								     style={{display: (this.state.activeMovie === this.state.results[result].imdbID ? 'block' : 'none')}}>
									<div>Year: {this.state.results[result].Year}</div>
									<div>Type: {this.state.results[result].Type}</div>
									<div>IMDB ID: {this.state.results[result].imdbID}</div>
								</div>
							</td>
							<td>
								<select className="rate"
								        onChange={this.setMovieRate.bind(this, index)}
								        value={this.getMovieRate(this.state.results[result].imdbID)}>
									{this.state.rates.map((rate) => <option key={rate}>{rate}</option>)}
								</select>
							</td>
						</tr>
					)}
					</tbody>
				</table>
			</div>
		);
	};

	Movies = () => {
		return (
			<div>
				<table id="results">
					<thead>
					<tr>
						<th>Poster</th>
						<th onClick={() => this.sortBy('ratedMovies', this.state.ratedMovies, 'Title')}>Title</th>
						<th onClick={() => this.sortBy('ratedMovies', this.state.ratedMovies, 'Rate')}>Rate</th>
					</tr>
					</thead>
					<tbody>
					<tr style={{display: (Object.keys(this.state.ratedMovies).length > 0 ? 'none' : 'table-cell')}}>
						<td colSpan="3">
							List is empty
						</td>
					</tr>
					{Object.keys(this.state.ratedMovies).map((result, index) =>
						<tr key={index}>
							<td>
								<img src={this.state.ratedMovies[result].Poster} alt="" className="poster"/>
							</td>
							<td>
								<div className="clickable"
								     onClick={() => this.setState({activeMovie: this.state.ratedMovies[result].imdbID})}>
									{this.state.ratedMovies[result].Title}
								</div>
								<div className="details"
								     style={{display: (this.state.activeMovie === this.state.ratedMovies[result].imdbID ? 'block' : 'none')}}>
									<div>Year: {this.state.ratedMovies[result].Year}</div>
									<div>Type: {this.state.ratedMovies[result].Type}</div>
									<div>IMDB ID: {this.state.ratedMovies[result].imdbID}</div>
								</div>
							</td>
							<td>
								{this.getMovieRate(this.state.ratedMovies[result].imdbID)}
							</td>
						</tr>
					)}
					</tbody>
				</table>
			</div>
		);
	};


	render() {
		return (
			<Router>
				<div>
					<h1>Rate that movie</h1>
					<nav>
						<ol>
							<li>
								<Link to="/">Search for movies</Link>
							</li>
							<li>
								<Link to="/movies">My movies</Link>
							</li>
						</ol>
					</nav>

					<hr/>

					<Switch>
						<Route path="/movies">
							{this.Movies}
						</Route>
						<Route path="/">
							{this.Home}
						</Route>
					</Switch>
				</div>
			</Router>
		);
	}
}

export default App;