
/*
    Basic Chat Connection Demo - Server

    You can see, using the same url in different browsers, different nicks that introducing these are appearing on all screens

    author: @manufosela
    [2012-11-29]
*/

var config = require( "./config" );

/**
* Servidor web para ficheros html
*
* Web server to html files
*/
var connect = require( 'connect' );
connect.createServer(
    connect.static( __dirname )
).listen( config.http_port );

/**
* Servidor de chat usando websockets
*
* Chat server using websockets
*/
var io = require('socket.io').listen( config.socket_port ),
    aUserList = [],
    chatRooms = [];

io.set( 'log level', 1 );  // To avoid debug info. Comment this line if you want to see it

io.sockets.on( 'connection', function ( socket ) {

  console.log( "connection " )
  console.log( "users logged: " + aUserList.length );
  socket.emit( 'connection ok' );
  if ( aUserList.length > 0 ) {
    socket.emit( 'userlist' , { userlist: aUserList } );
  }

  socket.on( 'set nickname', function ( name ) {
    console.log( "setting nickname..." );
    if ( name ) {
      if ( !~aUserList.indexOf(name) ) {
        socket.set( 'nickname', name, function () { socket.emit('login ok'); });
        //aSockets[name] = socket;
        aUserList.push(name);
        senduserlist();
        console.log( "Set nickname " + name );
      } else {
        socket.emit( 'login fail', { namenovalid: name } );
        console.log( "Nickname '" + name + "' ya existe" );
      }
    } else {
      socket.emit('login fail' );
      console.log( "Nickname nulo" );
    }
  });

  socket.on( 'msg', function ( data ) {
    socket.get('nickname', function ( err, name ) {
      console.log('Chat message from', name);
      console.log(data);
      io.sockets.emit( 'message' , { from: name, msg: data } );
    });
  });

  socket.on( 'roommsg', function ( data ) {
    console.log( "roommsg: " + JSON.stringify(data) );
    io.sockets.in( data.chatroom ).emit( 'message', { action: 'roommsg', chatroom: data.chatroom, msg: data.msg, from: data.from } );
  });

  socket.on( 'roomclose', function ( data ) {
    console.log( "roomclose: " + JSON.stringify(data) );
    io.sockets.in( data.chatroom ).emit( 'message', { action: 'closechatroom', chatroom: data.chatroom } );
  });

  socket.on( 'join', function( data ) {
    var chatroom = data.me + " with " + data.with;
    console.log( "Joining " + data.me + " to chat room " + chatroom );
    socket.join( chatroom  );
    chatRooms.push( chatroom );
    io.sockets.emit( 'message' , { action:'joinwith', chatroom: chatroom, with: data.with, from:data.me } );
    //socket.emit( 'message', { from:'server', msg:'Enlazado con ' + data.with } );
  });

  socket.on( 'joinaccepted', function( data ) {
    console.log( "Join accepted. Joining " + data.me + " to chat room " + data.chatroom );
    socket.join( data.chatroom );
    io.sockets.in( data.chatroom ).emit( 'message', { action:'joined', chatroom: data.chatroom } );
  });

  socket.on( 'disconnect', function ( data ) {
    console.log( "desconectado " + data );
    socket.get( 'nickname', function ( err, name ) {
      console.log( 'Se desconecta ' + name + "( ERROR:" + err + ")" );
      aUserList.splice( aUserList.indexOf( name ), 1 );
      senduserlist();
      var room;
      for ( var key in chatRooms ) {
        roomUser = chatRooms[key].split( " with " );
        if ( roomUser[0] == name || roomUser[1] == name ) {
          console.log( name + " is leaving room " + chatRooms[key] );
          socket.leave( chatRooms[key] );
        }

      }
    });
  });

  senduserlist = function() {
    console.log( "Enviando por broadcast la lista de usuarios conectados " + aUserList );
    io.sockets.emit( 'userlist' , { userlist: aUserList } );
  }

});




/*

BROADCAST MESSAGE

io.sockets.emit('bla bla');
socket.broadcast.emit('user connected');
socket.broadcast.json.send({ a: 'message' });


ROOMS

socket.join('justin bieber fans');
socket.broadcast.to('justin bieber fans').emit('new fan');
io.sockets.in('rammstein fans').emit('new non-fan');


socket.leave('justin bieber fans');
socket.join('room1');

io.sockets.clients(rooms[0]);  // DEVUELVE LOS USUARIO CONECTADOS A LA ROOM


io.sockets.in(socket.room).leave(socket.room);

EN CLIENTE
io.connect('http://localhost', {
  'reconnect': true,
  'reconnection delay': 500,
  'max reconnection attempts': 10
});

*/