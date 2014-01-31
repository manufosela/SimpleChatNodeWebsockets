SimpleChatNodeWebsockets
========================

Simple chat with node.js and HTML5 websockets



INSTALL
=======

Get source code from git:

       $> git clone https://github.com/manufosela/SimpleChatNodeWebsockets.git

       $> cd SimpleChatNodeWebsockets

Install socket.io:

       $> npm install socket.io

If you have an error with gyp use: 

       $> npm install socket.io@"~0.8.1" -g

After this install:

       $> npm install connect

Edit the js/config.js file and change yout host/ip. It will be the same of the client.

Execute the server:

       $> node server.js

And it show:
       info  - socket.io started
    
    
Then you can open a browser and type client.html
