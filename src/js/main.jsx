import React from 'react';
import Immutable from 'immutable';
import { Terminal } from './views.jsx';
import { Flux } from './flux.jsx';
import FluxComponent from 'flummox/component';
import { connectTermToDOM } from './term.js';

const flux = new Flux();

React.render(
<FluxComponent flux={flux} connectToStores={['lines']}>
  <Terminal />
</FluxComponent>,
  document.getElementById('page')
);

connectTermToDOM(flux);

const env = flux.getStore('env')
env.setEnv("PWD", "/");
const fs = flux.getStore('fs')
const about = fs.writeFileStream(fs.pathFromString('/', 'about.txt'));
about.write(`
   --------------------------------------------------------------
   |                                                            |
   |                   -==~ Brandon Kase ~==-                   |
   |                                                            |
   |  I like types and making things.                           |
   |                                                            |
   |  Currently working on Roll @ Highlight: tryroll.com        |
   |  Studied @ Carnegie Mellon, SCS 2014                       |
   |  Interned @ Qualcomm, Facebook, Mozilla                    |
   |                                                            |
   |  This is a unix-like shell on an in-memory filesystem.     |
   |  Try cat,ls,cp,rm,mkdir,cd,echo,sh. I/O redirection works. |
   |  You can even run another sh inside this sh!               |
   |                                                            |
   |  Run "sh < /bin/contactme.sh" to contact me.               |
   |  Run "sh < /bin/blog.sh" to go to blog.                    |
   |  Run "sh < /bin/resume.sh" to get resume.                  |
   |                                                            |
   --------------------------------------------------------------
`);
about.end();

fs.mkdir(fs.pathFromString('/', 'bin'));
const contactmesh = fs.writeFileStream(fs.pathFromString('/bin', 'contactme.sh'));
contactmesh.write("echo brandon        .       kase    @  gmail                 . com");
contactmesh.end();
const blogsh = fs.writeFileStream(fs.pathFromString('/bin', 'blog.sh'));
blogsh.write("open todo");
blogsh.end();
const resumesh = fs.writeFileStream(fs.pathFromString('/bin', 'resume.sh'));
resumesh.write("open todo");
resumesh.end();

