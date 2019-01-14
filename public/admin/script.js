$(document).ready(function(){
  $('.tabs').tabs();
  $('.modal').modal();
  $('.datepicker').datepicker();

  $('#preloader_userForm_div').hide();
  $('#preloader_submit_div').hide();
  //$('#submit').hide();

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
    let exists = false;
    let user = getUserInfo();
      if (user == null)
        return;
    $('#submit').hide();
    $('#preloader_submit_div').show();
    if ($('#submitType').text() == 1){
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
      })
    }
  });
});

function teste(){
  console.log('asd');
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

function updateData(){
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
        })
        
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

