import React from 'react'
import ReactDOM from 'react-dom';
import $ from 'jquery';
import ReviewList from './components/ReviewList.jsx';
import Rating from './components/Rating.jsx';
import Search from './components/Search.jsx';
import SearchSummary from './components/SearchSummary.jsx';


class ReviewSection extends React.Component{
  constructor(props) {
    super(props)
    this.state={
      searchStatus:false,
      searchCount:7,
      searchedList:[],
      searchValue:"jinjing",
      hostID:56,
      reviewList:[],
      rating:{},
      overallRate:0,
      lastPage:0,
      count:0,
      currentList:[]
    }

    this.calculeteAverageRating = this.calculeteAverageRating.bind(this);
    this.currentPageReviewList = this.currentPageReviewList.bind(this);
    this.renderCurrentPage = this.renderCurrentPage.bind(this);
    this.clearSearchValue = this.clearSearchValue.bind(this);
    this.submitSearchValue = this.submitSearchValue.bind(this);
    this.changeSearchValue = this.changeSearchValue.bind(this);
    this.calculateSearchList = this. calculateSearchList.bind(this)
  }

  //setup for initial rendering
  componentDidMount(){
    $.get('/api/reviews',{host:this.state.hostID},(data) => {
      const rating = this.calculeteAverageRating(data);
      const count = rating.count;
      const lastPage = Math.ceil(count / 7);
      const currentList = this.currentPageReviewList(1,data,count)

      this.setState({
        lastPage,
        rating,
        reviewList:data,
        currentList,
        count,
        overallRate:rating.review
      })
    })
  }

  //functions for search bar
  submitSearchValue(){
    if(this.state.searchValue !== "") {
      let keyWord = this.state.searchValue;
      let searchedList = this.calculateSearchList(keyWord);
      let searchCount = searchedList.length
      let lastPage = Math.ceil(searchCount / 7);


      this.setState({
        searchStatus:true,
        searchCount,
        searchedList,
        lastPage
      })
    }
  }

  changeSearchValue(value){
    this.setState({
      searchValue:value
    })
  }

  clearSearchValue(){
    const lastPage = Math.ceil(this.state.count / 7);
    this.setState({
      lastPage,
      searchStatus:false,
      searchValue:"",
      searchCount:0,
      searchedList:[]
    })
  }

  //help function to filter reviews that contain key word
  calculateSearchList(keyWord){
    let filteredList = this.state.reviewList.filter((reviewObj) =>
       reviewObj.comments.toUpperCase().includes(keyWord.toUpperCase())
    )
    return filteredList
  }


  //function for reviews rendering
  renderCurrentPage(curPg){
    const currentList = this.state.searchStatus? this.currentPageReviewList(curPg,this.state.searchedList,this.state.searchCount): this.currentPageReviewList(curPg,this.state.reviewList,this.state.count)
    this.setState({
      currentList
    })
  }

  //help function to calculate current page index
  currentPageReviewList(curPg,reviewList,count){
    let beginIndex = (curPg - 1) * 7;
    let endingIndex = Math.min(beginIndex + 6,count-1);
    return reviewList.slice(beginIndex, endingIndex+1);
  }

  //help function to render rating
  calculeteAverageRating(data){
    const ratingList =[...data];
    const length = ratingList.length;
    let newRating = {};
    ratingList.forEach((rating) => {
      let ratingType = ['rating_accuracy', 'rating_communication', 'rating_cleanliness', 'rating_location', 'rating_checkin', 'rating_value'];

      ratingType.forEach((type) => {
        if(!newRating[type]) {
          newRating[type] = rating[type];
        } else {
          newRating[type] += rating[type];
        };
      })
    });

    let total = 0;
    Object.keys(newRating).forEach((key) => {
      total += newRating[key];
      newRating[key] = Math.round(newRating[key]*2/length)/2;
    });
    newRating.review = Math.round(total*2/length/6)/2;
    newRating.count = length;
    return newRating;
  }

  render() {
    return (
      <div>
        <div>
          {this.state.rating.count} Reviews {this.state.rating.review}
          <Search
            searchValue={this.state.searchValue}
            clearSearchValue={this.clearSearchValue}
            changeSearchValue = {this.changeSearchValue}
            submitSearchValue={this.submitSearchValue}
          />
        </div>
        {!this.state.searchStatus?
          <Rating rating={this.state.rating}/> :
          <SearchSummary
            searchCount={this.state.searchCount}
            searchValue={this.state.searchValue}
            clearSearchValue={this.clearSearchValue}
          />
        }

        {!this.state.searchStatus?
          <ReviewList
            reviewList={this.state.currentList}
            lastPage={this.state.lastPage}
            count={this.state.count}
            renderCurrentPage = {this.renderCurrentPage}
            searchStatus = {this.state.searchStatus}
          />:
          <ReviewList
            reviewList={this.state.currentList}
            lastPage={this.state.lastPage}
            count={this.state.searchCount}
            renderCurrentPage = {this.renderCurrentPage}
            searchStatus = {this.state.searchStatus}
          />
        }
      </div>
      )
  }
}


ReactDOM.render(
  <ReviewSection/>, document.getElementById('app')
)