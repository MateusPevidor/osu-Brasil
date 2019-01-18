class dataInfo{
  constructor(){
    this.playerInfo = new Array();
    this.numberOfPages = 0;
    this.currentPage = 1;
  }
}
let Information = new dataInfo();

$(document).ready(function(){
  $('.parallax').parallax();
  $('.dropdown-trigger').dropdown();

  $('#nav-topPlayers').on('click', function(){
    $('html, body').animate({
        scrollTop: $('#topPlayers-section').offset().top
    }, 650);
  });
  $('#nav-beatmaps').on('click', function(){
    $('html, body').animate({
        scrollTop: $('#beatmaps-section').offset().top
    }, 650);
  });
  $('#nav-news').on('click', function(){
    $('html, body').animate({
        scrollTop: $('#news-section').offset().top
    }, 650);
  });
  

  showContent();
  
});

function showContent() {
  writeNews();
  writeBeatmaps();
  fillTopPlayersTable();
}

function writeNews() {
  db.collection("news").get().then((query) => {
    let news = new Array();
    let i;
    let str = '';
    query.forEach((data) => {
      news.push(data.data());
    });

    news.sort(function (a, b) {
      if (a.date > b.date) return -1;
      else if (a.date < b.date) return 1;
      else return 0;
    });
    let len = 4;
    if (news.length < 4){
      len = news.length;
    }
    for (i = 0; i < len; i++){
      str += getNewsCardStructure(news[i].title, news[i].body, news[i].imgSrc, i % 2);
    }
    $('#news-section').append(str);
  });
}

function writeBeatmaps() {
  db.collection("beatmaps").get().then((query) => {
    let beatmaps = new Array();
    let i;
    let str = '';
    query.forEach((data) => {
      beatmaps.push(data.data());
    });

    beatmaps.sort(function (a, b) {
      if (a.insertion_date > b.insertion_date) return -1;
      else if (a.insertion_date < b.insertion_date) return 1;
      else return 0;
    });

    let len = 8;
    if (beatmaps.length < 8){
      len = beatmaps.length;
    }
    for (i = 0; i < len; i++){
      str += getBeatmapCardStructure(beatmaps[i], i % 4);
    }
    $('#beatmaps-section').append(str);

  });
}

function fillTopPlayersTable() {
  db.collection("users").get().then((query) => {
    query.forEach((data) => {
      let pp_raw = data.data().pp_raw;
      if (pp_raw.length > 5){
        pp_raw = pp_raw.substr(0, pp_raw.length-5) + '.' + pp_raw.substr(pp_raw.length-5, pp_raw.length-(pp_raw.length-5));
      }

      let player = data.data();
      player.pp_raw = pp_raw;

      Information.playerInfo.push(player);

    })
    sortTable(1);
    appendToTable();
    writePagination();
  });
}

function appendToTable(){
  $('#top-players-table-tbody').empty();
  for (let i = (Information.currentPage-1)*10; i < Information.currentPage*10; i++){
    if (Information.playerInfo[i] == undefined){
      break;
    }
    $('#top-players-table-tbody').append('<tr><td>' + Information.playerInfo[i].pp_country_rank + 
          '</td><td><a href="https://osu.ppy.sh/u/' + Information.playerInfo[i].username +
          '" target="_blank">' + Information.playerInfo[i].username +
          '</a></td><td>' + Information.playerInfo[i].pp_rank +
          '</td><td>' + Information.playerInfo[i].pp_raw +
          '<a href="profile.html?u=' + Information.playerInfo[i].username +
          '"><i class="material-icons small right">open_in_new</i></a></td></tr>');
  }
}

function writePagination(){
  if (parseInt(Information.playerInfo.length)%10 == 0){
    Information.numberOfPages = parseInt(Information.playerInfo.length/10)
  } else {
    Information.numberOfPages = parseInt(Information.playerInfo.length/10)+1;
  }
  
  $('#pages').empty();
  $('#pages').append('<li class="disabled" id="pagination-previousPage" onclick="previousPage()"><a href="#!"><i class="material-icons">chevron_left</i></a></li>');
  //$('#pages').append('<li class="waves-effect active" onclick="changePage(1)" id="pagination-page1"><a href="#!">1</a></li>');
  if (Information.playerInfo.length > 10){
    let min, max;

    if (Information.numberOfPages <= 5){
      min = 1; max = Information.numberOfPages;
    } else {
      if (Information.currentPage > Information.numberOfPages-2){
        min = Information.numberOfPages - 4; max = Information.numberOfPages;
      } else if (Information.currentPage > 3){
        min = Information.currentPage - 2; max = Information.currentPage + 2;
      } else {
        min = 1; max = 5;
      }
    }

    for (let i = min-1; i < max; i++){
      $('#pages').append('<li class="waves-effect" onclick="changePage(' + Number(i+1) + ')" id="pagination-page' + Number(i+1) + '"><a href="#!">' + Number(i+1) + '</a></li>');
    }
    $('#pages').append('<li class="waves-effect" id="pagination-nextPage" onclick="nextPage()"><a href="#!"><i class="material-icons">chevron_right</i></a></li>');
  } else {
    $('#pages').append('<li class="disabled" id="pagination-nextPage" onclick="nextPage()"><a href="#!"><i class="material-icons">chevron_right</i></a></li>');
  }
  
  
  
  
  $('#pagination-page' + Information.currentPage).attr('class', 'waves-effect active');
}

function changePage(pageNumber){
  Information.currentPage = pageNumber;
  writePagination();
  for (let i = 0; i < Information.numberOfPages; i++){
    $('#pagination-page' + Number(i+1)).attr('class', 'waves-effect');
  }
  $('#pagination-page' + pageNumber).attr('class', 'waves-effect active');

  if (pageNumber > 1){
    $('#pagination-previousPage').attr('class', 'waves-effect');
  } else {
    $('#pagination-previousPage').attr('class', 'disabled');
  }
  if (pageNumber == Information.numberOfPages){
    $('#pagination-nextPage').attr('class', 'disabled');
  } else {
    $('#pagination-nextPage').attr('class', 'waves-effect');
  }
  appendToTable();
}

function nextPage(){
  if (Information.currentPage != Information.numberOfPages){
    Information.currentPage += 1;
    changePage(Information.currentPage);
  }
}

function previousPage(){
  if (Information.currentPage != 1){
    Information.currentPage -= 1;
    changePage(Information.currentPage);
  }
}

function sortTable(sortType) {
  // SORTTYPE => 0: A-Z | 1: Ranking
  Information.playerInfo.sort(function(a, b){
    let keyA, keyB;
    if (sortType == 0){
      keyA = a.username;
      keyB = b.username;
      return ('' + keyA).localeCompare(keyB);
    } else if (sortType == 1){
      keyA = parseInt(a.pp_country_rank.substr(1, a.pp_country_rank.length));
      keyB = parseInt(b.pp_country_rank.substr(1, b.pp_country_rank.length));
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    }
    
  })
  changePage(1);
}

function getNewsCardStructure(title, body, imgSrc, isRight) {
  let str = '';
  if (isRight == 0){
    str += '<div class="row">';
  }
  str += '<div class="col s4';
  if (isRight == 0){
    str += ' offset-s2';
  }
  str += '">';
  str += '<div class="card">';
  str += '<div class="card-image waves-effect waves-block waves-light">';
  str += '<img class="activator" src="' + imgSrc + '">';
  str += '</div>';
  str += '<div class="card-content">';
  str += '<span class="card-title activator grey-text text-darken-4">' + title + '<i class="material-icons right">more_vert</i></span>';
  str += '</div>';
  str += '<div class="card-reveal">';
  str += '<span class="card-title grey-text text-darken-4">' + title + '<i class="material-icons right">close</i></span>';
  str += '<p>' + body + '</p>';
  str += '</div></div></div>';

  if (isRight == 1){
    str += '</div>';
  }

  return str;
}

function getBeatmapCardStructure(beatmap, isFirst){
  let str = '';
  if (isFirst == 0){
    str += '<div class="row">';
  }
  str += '<div class="col s2';
  if (isFirst == 0){
    str += ' offset-s2';
  }
  str += '">';
  str += '<div class="card">';
  str += '<div class="card-image waves-effect waves-block waves-light">';
  str += '<img class="activator" src="' + beatmap.imgSrc + '">';
  str += '</div>';
  str += '<div class="card-content">';
  str += '<span class="card-title beatmap-card activator grey-text text-darken-4">' + beatmap.artist + '-' + beatmap.title + '</span>';
  str += '<p><a href="https://osu.ppy.sh/s/' + beatmap.id + '" target="_blank">Ver no site</a> <span class="mapper-name">' + beatmap.mapper + '</span></p>';
  str += '</div>';
  str += '<div class="card-reveal">';
  str += '<span class="card-title grey-text text-darken-4" style="font-size: 115%;">' + beatmap.artist + '-' + beatmap.title + '<i class="material-icons right">close</i></span>';
  str += '<p>Vezes Jogadas: ' + beatmap.playcount + '</p>';
  str += '<p>Favoritos: ' + beatmap.favourites + '</p>';
  str += '<p>Mapeado por: <a href="https://osu.ppy.sh/u/' + beatmap.mapper_id + '" target="_blank">' + beatmap.mapper + '</a></p>';
  str += '</div></div></div>';

  if (isFirst == 3){
    str += '</div>';
  }

  return str;
}