"use strict";

var urlAgendamento    = 'https://agendamento.unifisiocascavel.com.br/';
var unfisioApi        = 'https://unifisiocascavel.com.br/wp-json/wp/v2/';
var destaquePg        = '3';
var editoriaPg        = '5';
var outrasNoticiasPg  = '5';
var noImage           = '/img/sem_imagem.png';
var userData          = null;
var urlLogout         = urlAgendamento+'api/auth/logout';
var $$ = Dom7;
function init() {
  app.preloader.init('.ptr-preloader')
  var starringExcludeArr = [];
  app.request.json(unfisioApi+'posts/?_embed', function (data) {
    data.forEach(function(v,i){
      starringExcludeArr.push(v.id);
      if(!v._embedded['wp:featuredmedia']){
        var imagem = noImage;
      }else {
        var imagem = v._embedded['wp:featuredmedia']['0'].source_url;
      }
      var cardPrincipalHtml = 
          '<div class="card card-expandable elevation-3">'+
            '<div class="card-content">'+
              '<div style="background: url('+imagem+') no-repeat center bottom; background-size: cover; height: 240px">'+
            '</div>'+
              '<a href="#" class="link card-close card-opened-fade-in color-white" style="position: absolute; right: 15px; top: 15px">'+
                '<i class="icon f7-icons">xmark_circle_fill</i>'+
              '</a>'+
              '<div class="card-header display-block">'+v.title.rendered+'</div>'+
              '<div class="card-content-padding">'+
                v.content.rendered
              '</div>'+
            '</div>'+
          '</div>';
      app.preloader.hide();
      $$('.page-content').find('#servicos').append(cardPrincipalHtml);
    });
  });
}
function navbarButtons(){
  $$('#user-info').html('<a href="/login" class="link login-link">Login</a><a href="/register" class="link register-link">Cadastre-se</a><i class="f7-icons size-12">person_crop_square_fill</i>');
}
function loggedUser(){
  if(window.localStorage['user']){
    $$('#user-info').html('<a href="/profile" class="link name-user">'+JSON.parse(window.localStorage['user'])['name']+'</a>'+
    '<a href="/agendamento" class="link icon-navbar-link"><i class="icon f7-icons ios-only">clock_fill</i></a>'+
    '<a href="/logout" class="link icon-navbar-link logout-link"><i class="icon f7-icons ios-only">arrow_right_square_fill</i></a>');
  }
}
var app = new Framework7({
    root: '#app',
    id: 'com.giuliano.unifisio',
    theme: 'ios',
    tapHold: true,
    panel: {
        swipe: true,
    },
    routes: [
        {
          path: '/',
          url: 'index.html',
        },
        {
          path: '/login',
          url: './pages/login.html',
        },
        {
          path: '/logout',
          async: function(routeTo, routeFrom, resolve, reject){
            app.dialog.confirm('Você tem certeza?', function () {
                  app.request.setup({
                    headers: {
                      'Authorization': JSON.parse(window.localStorage['token'])['token_type']+" "+JSON.parse(window.localStorage['token'])['access_token']
                    }
                  })
                  app.request.json(urlAgendamento+'api/auth/logout', function (user) {
                      window.localStorage.removeItem('user');
                      window.localStorage.removeItem('token');
                      location.reload();
                  });
            });
          },
        },
        {
          path: '/profile',
          // url: './pages/profile.html',
          async: function (routeTo, routeFrom, resolve, reject) {
            resolve({ url: 'pages/profile.html' })
            console.log(window.localStorage['user']);
            app.request.setup({
              headers: {
                'Authorization': JSON.parse(window.localStorage['token'])['token_type']+" "+JSON.parse(window.localStorage['token'])['access_token']
              }
            })
            app.request.json(urlAgendamento+'api/auth/user', function (data) {
                var calendarDefault = app.calendar.create({
                  inputEl: '#register-calendar',
                });
                $$('#name').html(data.name);
                $$('input[name = "name"]').val(data.name);
                $$('input[name = "email"]').val(data.email);
                $$('input[name = "cpf"]').val(data.cpf);
                $$('input[name = "gender"]').val(data.gender);
                $$('input[name = "birth"]').val(moment(data.birth).format("DD/MM/YYYY"));
                $$('input[name = "phone"]').val(data.phone);
            });
          }
        },
        {
          path: '/register',
          url: './pages/register.html',
        },
        {
          path: '/consulta/:pageId',
          async: function (routeTo, routeFrom, resolve, reject) {
            resolve({ url: 'pages/consulta.html' })
            app.request.json(urlAgendamento+'api/auth/consulta/'+routeTo.params.pageId, function (data) {
                var dataConsulta    = moment(data.start).format("DD/MM/YYYY HH:mm");
                var dataConsultaIn  = moment(data.start).format("HH:mm");
                var dataConsultaFim = moment(data.finish).format("HH:mm");
                $$('#data-consulta').html(dataConsulta);
                $$('#data-consulta-inicio').html(dataConsultaIn);
                $$('#data-consulta-fim').html(dataConsultaFim);
                $$('#description').html(data.description);
            });
          }
        },
        {
          path: '/change-password',
          async: function (routeTo, routeFrom, resolve, reject) {
            resolve({ url: 'pages/change-password.html' })
            app.request.setup({
              headers: {
                'Authorization': JSON.parse(window.localStorage['token'])['token_type']+" "+JSON.parse(window.localStorage['token'])['access_token']
              }
            })
            app.request.json(urlAgendamento+'api/auth/user', function (data) {
                $$('#name2').html(data.name);
            });
          }
        },
        {
            path: '/agendamento',
            async: function(routeTo, routeFrom, resolve, reject){
              resolve({url: 'pages/agendamento.html'});
              var pageContainer=$$('.agendamento');
              app.request.setup({
                headers: {
                  'Authorization': JSON.parse(window.localStorage['token'])['token_type']+" "+JSON.parse(window.localStorage['token'])['access_token']
                }
              })
              app.request.json(urlAgendamento+'api/auth/agenda', function (data) {
                  var agendamentos = data;
                  var postsByCategory = '';
                  agendamentos.forEach(function(v,i){
                    if(!v.description){
                      v.description = '<em class="text-color-gray">sem descrição</em>';
                    }
                    postsByCategory += '<li class="media-item">'+
                      '<a href="/consulta/'+v.id+'" class="item-link">'+
                        '<div class="item-content">'+ 
                          '<div class="item-inner">'+
                            '<div class="item-title-row"><div class="item-title">'+v.description+'</div></div>'+
                            '<div class="item-after"><span><i class="icon ion-md-time"></i>'+moment(v.start).format("DD/MM/YYYY HH:mm")+'</span></div>'+
                          '</div>'+
                        '</div>'+
                      '</a>'+
                    '</li>';
                  });
                  $$('.ptr-content').find('#postListByCategory').append(postsByCategory);
              });
              app.preloader.hide();
              app.ptr.done($$('#category-list'));
            }
        },
        {
          path: '/agendar',
          url: './pages/agendar.html',
          // async: function (routeTo, routeFrom, resolve, reject) {
          //   resolve({ url: 'pages/agendar.html' })
          //   $$('#welcome').html(JSON.parse(window.localStorage['user'])['name']+', agende seu horário selecionando a data desejada');
            // app.request.json(urlAgendamento+'api/auth/consulta/'+routeTo.params.pageId, function (data) {
            //     var dataConsulta    = moment(data.start).format("DD/MM/YYYY HH:mm");
            //     var dataConsultaIn  = moment(data.start).format("HH:mm");
            //     var dataConsultaFim = moment(data.finish).format("HH:mm");
            //     $$('#data-consulta').html(dataConsulta);
            //     $$('#data-consulta-inicio').html(dataConsultaIn);
            //     $$('#data-consulta-fim').html(dataConsultaFim);
            //     $$('#description').html(data.description);
            // });
          // }
        }
    ]
});
var viewMain = app.views.create('.view-main');
if(!window.localStorage['token']){
  navbarButtons();
}else {
  loggedUser();
}
init();
$$(document).on('page:init', function (e, page) {
  var pageContainer=page.$pageEl;
  loggedUser();
  switch(page.name)
  {
    case "login":
      $$('.login').find('.button').on('click', function () {
        var uname = $$('.login input[name = "username"]').val();
        var pwd = $$('.login input[name = "password"]').val();

        app.request.postJSON(urlAgendamento+'api/auth/login', { email:uname, password: pwd }, function (data) {
          app.request.setup({
            headers: {
              'Authorization': data['token_type']+" "+data['access_token']
            }
          })
          app.request.json(urlAgendamento+'api/auth/user', function (user) {
              window.localStorage.setItem('user', JSON.stringify(user));
              loggedUser();
          });
          
          window.localStorage.setItem('token', JSON.stringify(data));
          viewMain.router.navigate("/agendamento", {reloadCurrent: true});
        });
      });
    break;
    case "register":
      var calendarDefault = app.calendar.create({
        inputEl: '#register-calendar',
      });
      $$('.login').find('.button').on('click', function () {
        var name = $$('.login input[name = "name"]').val();
        var email = $$('.login input[name = "email"]').val();
        var cpf = $$('.login input[name = "cpf"]').val();
        var gender = $$('.login select[name = "gender"]').val();
        var birth = $$('.login input[name = "birth"]').val();
        var phone = $$('.login input[name = "phone"]').val();
        var password = $$('.login input[name = "password"]').val();
        var c_password = $$('.login input[name = "c_password"]').val();
        app.request.postJSON(urlAgendamento+'api/auth/signup', { name:name, email:email, cpf:cpf, gender:gender, birth:birth, phone:phone, password: password, c_password:c_password }, function (data) {
          app.request.setup({
            headers: {
              'Authorization': data['token_type']+" "+data['access_token']
            }
          })
          app.request.json(urlAgendamento+'api/auth/user', function (user) {
              window.localStorage.setItem('user', JSON.stringify(user));
              loggedUser();
          });
          
          window.localStorage.setItem('token', JSON.stringify(data));
          viewMain.router.navigate("/agendamento", {reloadCurrent: true});
        });
      });
    break;
    case "profile":
      $$('#profile').find('.button').on('click', function () {
        var name = $$('input[name = "name"]').val();
        var email = $$('input[name = "email"]').val();
        var cpf = $$('input[name = "cpf"]').val();
        var gender = $$('select[name = "gender"]').val();
        var birth = $$('input[name = "birth"]').val();
        var phone = $$('input[name = "phone"]').val();
        app.request.postJSON(urlAgendamento+'api/auth/profile', { name:name, email:email, cpf:cpf, gender:gender, birth:birth, phone:phone }, function (data) {
          app.dialog.alert(data.message, 'Sucesso!');
          loggedUser();
          viewMain.router.navigate("/");
        });
      });
    break;
    case "change-password":
      $$('#password').find('.button').on('click', function () {
        var password = $$('input[name = "password"]').val();
        var c_password = $$('input[name = "c_password"]').val();
        app.request.postJSON(urlAgendamento+'api/auth/change-password', { password:password, c_password:c_password }, function (data) {
          app.dialog.alert(data.message, data.title);
          if(data.type == 2) {
            loggedUser();
            viewMain.router.navigate("/");
          }
        }, function (error){
          if(JSON.parse(error['response']).errors['password']){
            $$('#password-input .item-input-error-message').html(JSON.parse(error['response']).errors['password']).css('display','block');
          }else {
            $$('#password-input .item-input-error-message').css('display','none');
          }
          if(JSON.parse(error['response']).errors['c_password']){
            $$('#c_password-input .item-input-error-message').html(JSON.parse(error['response']).errors['c_password']).css('display','block');
          }else {
            $$('#c_password-input .item-input-error-message').css('display','none');
          }
        });
      });
    break;
    case "agendar":
      $$('#welcome').html(JSON.parse(window.localStorage['user'])['name']+', agende seu horário.');

      $$('#button-agendar').on('click', function () {
        var start = $$('input[name = "agendar"]').val();
        var description = $$('input[name = "description"]').val();
        app.request.postJSON(urlAgendamento+'api/auth/agendar', { start:start, description:description}, function (data) {
          app.dialog.alert(data.message, data.title);
          if(data.type == 2) {
            viewMain.router.navigate("/");
          }
        }, function (error){
          if(JSON.parse(error['response']).errors['start']){
            $$('#agendamento-error').html(JSON.parse(error['response']).errors['start']).css('display','block');
          }else {
            $$('#agendamento-error').css('display','none');
          }
        });
      });


      let calendarInline;
      var monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      calendarInline = app.calendar.create({
        locale: 'pt-BR',
        containerEl: '#agendar-calendario',
        inputEl: '#picker-date',
        timePicker: true,
        toolbarCloseText: "Confirmar",
        // dateFormat: { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', seconds: 'numeric' },
        dateFormat: 'yyyy-mm-dd HH::mm:ss',
        disabled(date) {
          return [0, 6].indexOf(date.getDay()) >= 0;
        },
        value: [new Date()],
        weekHeader: false,
        yearSelector: false,
        yearPicker: false,
        renderToolbar: function () {
          return `
          <div class="toolbar calendar-custom-toolbar no-shadow">
            <div class="toolbar-inner">
              <div class="left">
                <a href="#" class="link icon-only"><i class="icon icon-back ${app.theme === 'md' ? 'color-black' : ''}"></i></a>
              </div>
              <div class="center"></div>
              <div class="right">
                <a href="#" class="link icon-only"><i class="icon icon-forward ${app.theme === 'md' ? 'color-black' : ''}"></i></a>
              </div>
            </div>
          </div>
          `;
        },
        on: {
          init: function (c) {
            $$('.calendar-custom-toolbar .center').text(monthNames[c.currentMonth] + ', ' + c.currentYear);
            $$('.calendar-custom-toolbar .left .link').on('click', function () {
              calendarInline.prevMonth();
            });
            $$('.calendar-custom-toolbar .right .link').on('click', function () {
              calendarInline.nextMonth();
            });
          },
          monthYearChangeStart: function (c) {
            $$('.calendar-custom-toolbar .center').text(monthNames[c.currentMonth] + ', ' + c.currentYear);
          }
        }
      });
    break;
    case "home":
      init();
    break;
  }
});