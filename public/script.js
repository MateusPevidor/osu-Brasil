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
  $('#nav-news').on('click', function(){
    $('html, body').animate({
        scrollTop: $('#news-section').offset().top
    }, 650);
  });

  /*$('#topPlayers').on('click', function(){
    $('html, body').animate({
        scrollTop: $('#third').offset().top
    }, 500);
  });*/

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
});

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
  
  console.log(Information.playerInfo.length);
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