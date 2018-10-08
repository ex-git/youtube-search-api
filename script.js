const YOUTUBE_SEARCH_ENDPOINT = 'https://www.googleapis.com/youtube/v3/search';

//set your API key here
const API_key = '';

//API required 
function getApiData(keyword,token, success) {
  const query = {
    'key' : API_key,
    'q': keyword,
    //set the max result to display
    'maxResults': 10,
    'type': 'video',
    'part': 'snippet',
    'pageToken': token
  }
  const queryString = Object.keys(query).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`).join('&');
  fetch(YOUTUBE_SEARCH_ENDPOINT+"?"+queryString)
  .then(response => {if (response.ok) {
    return response.json()
    }
    else {
    throw new Error("Something is not right")
    }})
  .then(responseJson => renderHtml(responseJson))
  .catch(error => alert(error.message))

  //Use getJSON fot the same result
  //$.getJSON(YOUTUBE_SEARCH_ENDPOINT, query, success)
}

//this will catch the previous or next page click to render new result without reloading the page
function catchPage() {
  $('.js-result').on('click', 'a[class="page"]', event=>{
    event.preventDefault();
    let keyword = $('input[id="keyword"]').val();
    let token = $(event.currentTarget).attr('id');
    getApiData(keyword,token,renderHtml);
  })
}

//catch the submit button from the form
function catchSubmit() {
  $('.js-form').on('submit', event => {
    event.preventDefault();
    let keyword = $(event.currentTarget).find('#keyword').val();
    let token = '';
    getApiData(keyword,token,renderHtml);
  });
  catchImgClick();
  catchPage();
}

//catch click from result image and pop up light box to play video
function catchImgClick() {
  $('.result').on('click', 'img', event => {
    let current= $(event.currentTarget).attr('id');
    $('body').addClass('gray');
    $('.js-video').html(`<div class="video"><span class="close">Close</span><iframe id="video" width="420" height="315" src="//www.youtube.com/embed/${current}?rel=0" frameborder="0" allowfullscreen></iframe>
    </video>`)
  }
  );
  catchCloseClick();
}

//close the light box popup
function catchCloseClick() {
  $('.result').on('click', 'span[class="close"]', event => {
    $('.js-video').html('');
    $('body').removeClass('gray');
  })
}


function renderResult(each) {
  return `<h3 role="presentation"><a href="//www.youtube.com/embed/${each.id.videoId}" target="_blank">${each.snippet.title}</a></h3>
  <p><strong>Description:</strong> ${each.snippet.description}</p>

  <p><img id="${each.id.videoId}" src="${each.snippet.thumbnails.default.url}" class="img" alt="Click to play ${each.snippet.title}" width="${each.snippet.thumbnails.default.width}" height="${each.snippet.thumbnails.default.height}">`
}


function renderHtml(data) {
  const results = data.items.map(each => renderResult(each));
  const total = data.items.length;
  $('.js-result').html(results);
  if (data.prevPageToken && data.nextPageToken) {
    let prevPageToken = data.prevPageToken;
    let nextPageToken = data.nextPageToken;
    $('.js-result').prepend(`<a href="#" id="${prevPageToken}" class="page"><<< Previous</a>`);
    $('.js-result').append(`<a href="#" id="${nextPageToken}" class="page">Next >>></a>`)
  }
  else if (data.nextPageToken) {
    let nextPageToken = data.nextPageToken;
    $('.js-result').append(`<a href="#" id="${nextPageToken}" class="page">Next >>></a>`)
  }
  else if (data.previousPageToken) {
    let previousPageToken = data.previousPageToken;
    $('.js-result').prepend(`<a href="#" id="${previousPageToken}" class="page"><<< Previous</a>`)
  };
  $('.searchResult').prop('hidden', false);
  $('.totalResult').html(`<h2>Total ${total} result</h2>`);
}

$(catchSubmit);