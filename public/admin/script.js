$(document).ready(function(){
  $('.tabs').tabs();
  $('.modal').modal();
  $('.datepicker').datepicker();

  $('#preloader_userForm_div').hide();
  $('#preloader_submit_div').hide();

  $('#searchBtn_userForm').click(function(){
    getDataFromOsu(0);
  });

  $('#updateDataBtn').click(function(){
    updateData();
  });

  $('#tabPlayer').click(function(){
    $('#submitType').text('1');
  });
  $('#tabBeatmap').click(function(){
    $('#submitType').text('2');
  });
  $('#tabNews').click(function(){
    $('#submitType').text('3');
  });

  $('#submit').click(function(){
    submit();
  });

});

function changeSubmitType(value){
  $('#submitType').text(value);
}

function submit(){
  $('#submit').hide();
  $('#preloader_submit_div').show();
  let submitType = $('#submitType').text();
  if (submitType == 1){
    let exists = false;
    let user = getUserInfo();
    if (user == null)
      return;
    db.collection("users").get().then((query) => {
      query.forEach((data) => {
        if ($('#username_userForm').val().toUpperCase() == data.data().username.toUpperCase()){
          exists = true;
        }
      })
      if (!exists){
        db.collection("users").doc(user.username).set(user)
        .then(function() {
          $('#submit').show();
          $('#preloader_submit_div').hide();
          M.toast({html: 'Jogador cadastrado com sucesso!'});
        })
        .catch(function() {
          M.toast({html: 'Erro ao cadastrar jogador.'});
        });
      } else {
        $('#submit').show();
        $('#preloader_submit_div').hide();
        M.toast({html: 'Jogador já cadastrado.'});
      }
    });
  } else if (submitType == 2) {
    let beatmap = getBeatmapInfoFromForm();
    if (beatmap == null)
      return;
    db.collection("beatmaps").doc().set(beatmap)
    .then(function() {
      $('#submit').show();
      $('#preloader_submit_div').hide();
      M.toast({html: 'Beatmap inserido com sucesso!'});
      $('#beatmapLink_beatmapForm').val('');
      $('#mapper_beatmapForm').val('');
      $('#status_beatmapForm').val('');
      $('#artist_beatmapForm').val('');
      $('#title_beatmapForm').val('');
      $('#diffs_beatmapForm').val('');
      $('#playcount_beatmapForm').val('');
      $('#favourites_beatmapForm').val('');
    })
    .catch(function() {
      M.toast({html: 'Erro ao inserir beatmap.'});
    });
  } else if ( submitType == 3) {
    let news = getNewsInfo();
    if (news == null)
      return;
    db.collection("news").doc().set(news)
    .then(function() {
      $('#submit').show();
      $('#preloader_submit_div').hide();
      M.toast({html: 'Notícia inserida com sucesso!'});
      $('#title_newsForm').val('');
      $('#newsBody_newsForm').val('');
      $('#imgSrc_newsForm').val('');
    })
    .catch(function() {
      M.toast({html: 'Erro ao inserir notícia.'});
    })
  }
}

function getTodaysDate() {
  let str = '';
  let today = new Date();
  let day = today.getDate();
  let month = today.getMonth() + 1;
  let year = today.getFullYear();
  let hours = today.getHours();
  let minutes = today.getMinutes();
  let seconds = today.getSeconds();

  str += year;
  str += '-';
  if (month < 10)
    str += '0';
  str += month + '-';
  if (day < 10)
    str += '0';
  str += day + 'T';
  if (hours < 10)
    str += '0';
  str += hours + ':';
  if (minutes < 10)
    str += '0';
  str += minutes + ':';
  if (seconds < 10)
    str += '0';
  str += seconds + 'Z';
  
  return str;
}

function getDataFromOsu(type) {
  let input_username = $('#username_userForm').val();
  $('#searchBtn_userForm_div').hide();
  $('#preloader_userForm_div').show();
  $.getJSON('https://osu.ppy.sh/api/get_user?k=22a87727758fee0a858b67dc7487cdbba3337ed4&u=' + input_username, function(data){
    /* Data manipulation */
    if (data.length != 0){
      if (data[0].country == 'BR'){
        $('#countryRank_userForm').val("#" + data[0].pp_country_rank);
        $('#globalRank_userForm').val("#" + data[0].pp_rank);

        let str;
        if (data[0].pp_raw.includes('.')){
          str = data[0].pp_raw.substr(0, data[0].pp_raw.indexOf('.'));
        } else {
          str = data[0].pp_raw;
        }
        $('#performancePoints_userForm').val(str + "pp");
        
        $('#accuracy_userForm').val(data[0].accuracy.substr(0, 5) + "%");
        $('#playcount_userForm').val(data[0].playcount);

        if (data[0].level.includes('.')){
          str = data[0].level.substr(0, data[0].level.indexOf('.'));
        } else {
          str = data[0].level;
        }

        $('#level_userForm').val(str);
        $('#joinDate_userForm').val(data[0].join_date);


      } else {
        if (type == 0){
          M.toast({html: 'Jogador estrangeiro.'});
        }
      }
    } else {
      if (type == 0){
        M.toast({html: 'Jogador inexistente.'});
      }
    }
    

    $('#searchBtn_userForm_div').show();
    $('#preloader_userForm_div').hide();
  });
}

function getBeatmapInfo() {
  let input = $('#beatmapLink_beatmapForm').val();
  let isDiff = false;
  if (input == '')
    return;
  let beatmap_id;
  if (input.includes('/s/')){
    beatmap_id = input.substr(input.indexOf('/s/') + 3, input.length);
  } else if (input.includes('/b/')){
    beatmap_id = input.substr(input.indexOf('/b/') + 3, input.length);
    isDiff = true;
  }
  if (beatmap_id.includes('&')){
    beatmap_id = beatmap_id.substr(0, beatmap_id.indexOf('&'));
  }

  if (isDiff){
    $.getJSON('https://osu.ppy.sh/api/get_beatmaps?k=22a87727758fee0a858b67dc7487cdbba3337ed4&b=' + beatmap_id, function(data){
      if (data.length == 0)
        return;
      beatmap_id = data[0].beatmapset_id;
      requestBeatmapInfo(beatmap_id);
    });
  } else {
    requestBeatmapInfo(beatmap_id);
  }
}

function requestBeatmapInfo(id) {
  $('#beatmapID').text(id);
  let beatmap;
  $.getJSON('https://osu.ppy.sh/api/get_beatmaps?k=22a87727758fee0a858b67dc7487cdbba3337ed4&s=' + id, function(data){
    if (data.length == 0)
      return;
    beatmap = {
      creator: data[0].creator,
      status: '',
      artist: data[0].artist,
      title: data[0].title,
      diffs: data.length,
      playcount: 0,
      favourites: data[0].favourite_count
    }
    switch(data[0].approved){
      case '4':
        beatmap.status = 'Loved';
        break;
      case '3':
        beatmap.status = 'Qualificado';
        break;
      case '2':
        beatmap.status = 'Aprovado';
        break;
      case '1':
        beatmap.status = 'Ranqueado';
        break;
      case '0':
        beatmap.status = 'Pendente';
        break;
      case '-1':
        beatmap.status = 'Work in Progress';
        break;
      case '-2':
        beatmap.status = 'Cemitério';
        break;
    }
    for (let i = 0; i < data.length; i++){
      beatmap.playcount += parseInt(data[i].playcount);
    }
    setBeatmapInfo(beatmap);
  });
}

function setBeatmapInfo(beatmap){
  $('#mapper_beatmapForm').val(beatmap.creator);
  $('#status_beatmapForm').val(beatmap.status);
  $('#artist_beatmapForm').val(beatmap.artist);
  $('#title_beatmapForm').val(beatmap.title);
  $('#diffs_beatmapForm').val(beatmap.diffs);
  $('#playcount_beatmapForm').val(beatmap.playcount);
  $('#favourites_beatmapForm').val(beatmap.favourites);
}

function updateData(){
  let progress = 0;
  db.collection("users").get().then((query) => {
    let players = new Array();
    query.forEach((data) => {
      players.push(data.data());
    })
    
    for (let i = 0; i < players.length; i++){
      
      $.getJSON('https://osu.ppy.sh/api/get_user?k=22a87727758fee0a858b67dc7487cdbba3337ed4&u=' + players[i].username, function(data){
        players[i].accuracy = data[0].accuracy.substr(0, 5) + "%";
        let str;
        if (data[0].level.includes('.')){
          str = data[0].level.substr(0, data[0].level.indexOf('.'));
        } else {
          str = data[0].level;
        }
        players[i].level = str;
        players[i].playcount = data[0].playcount;
        players[i].pp_country_rank = "#" + data[0].pp_country_rank;
        players[i].pp_rank = "#" + data[0].pp_rank;
        if (data[0].pp_raw.includes('.')){
          str = data[0].pp_raw.substr(0, data[0].pp_raw.indexOf('.'));
        } else {
          str = data[0].pp_raw;
        }
        players[i].pp_raw = str + "pp";

        db.collection('users').doc(players[i].username).update({
          "accuracy" : players[i].accuracy,
          "level" : players[i].level,
          "playcount" : players[i].playcount,
          "pp_country_rank" : players[i].pp_country_rank,
          "pp_rank" : players[i].pp_rank,
          "pp_raw" : players[i].pp_raw
        });
        progress += 100/players.length;
        $('#progressBar').css('width', progress + '%');
        if (i == players.length-1) {
          $('#updateDataBtn').attr('disabled', 'disabled');
          $('#updateDataBtn').text('Dados Atualizados');
        }
      });
      
    }
  });
}

function getUserInfo(){
  if ($('#username_userForm').val() == "" ||
      $('#countryRank_userForm').val() == "" ||
      $('#globalRank_userForm').val() == "" ||
      $('#performancePoints_userForm').val() == "" ||
      $('#accuracy_userForm').val() == "" ||
      $('#playcount_userForm').val() == "" ||
      $('#level_userForm').val() == "" ||
      $('#joinDate_userForm').val() == "") {
    return null;
  }

  let user = {username: $('#username_userForm').val(),
              pp_country_rank: $('#countryRank_userForm').val(),
              pp_rank: $('#globalRank_userForm').val(),
              pp_raw: $('#performancePoints_userForm').val(),
              accuracy: $('#accuracy_userForm').val(),
              playcount: $('#playcount_userForm').val(),
              level: $('#level_userForm').val(),
              join_date: $('#joinDate_userForm').val()
            };
  return user;
  
}

function getNewsInfo(){
  if ($('#title_newsForm').val() == "" ||
      $('#newsBody_newsForm').val() == "" ||
      $('#imgSrc_newsForm').val() == "" ||
      $('#date_newsForm').val() == "") {
    return null;
  }

  let news = {title: $('#title_newsForm').val(),
              body: $('#newsBody_newsForm').val(),
              imgSrc: $('#imgSrc_newsForm').val(),
              date: getTodaysDate()
            };
  return news;
}

function getBeatmapInfoFromForm(){
  if ($('#beatmapID').text() == "" ||
      $('#mapper_beatmapForm').val() == "" ||
      $('#status_beatmapForm').val() == "" ||
      $('#artist_beatmapForm').val() == "" ||
      $('#title_beatmapForm').val() == "" ||
      $('#diffs_beatmapForm').val() == "" ||
      $('#playcount_beatmapForm').val() == "" ||
      $('#favourites_beatmapForm').val() == "") {
    return null;
  }

  let beatmap = {
    id: $('#beatmapID').text(),
    mapper: $('#mapper_beatmapForm').val(),
    artist: $('#artist_beatmapForm').val(),
    title: $('#title_beatmapForm').val(),
    imgSrc : '',
    playcount: $('#playcount_beatmapForm').val(),
    favourites: $('#favourites_beatmapForm').val(),
    insertion_date: getTodaysDate()
  }
  
  beatmap.imgSrc = 'https://b.ppy.sh/thumb/' + $('#beatmapID').text() + 'l.jpg';

  return beatmap;
}

function checkEnabled(){
  if ($('#username_userForm').val() != ""){
    $('#searchBtn_userForm').attr('class', 'waves-effect waves-light btn-small');
  } else {
    $('#searchBtn_userForm').attr('class', 'waves-effect waves-light btn-small disabled');
  }
  
  $('#countryRank_userForm').val('');
  $('#globalRank_userForm').val('');
  $('#performancePoints_userForm').val('');
  $('#accuracy_userForm').val('');
  $('#playcount_userForm').val('');
  $('#level_userForm').val('');
  $('#joinDate_userForm').val('');
}

