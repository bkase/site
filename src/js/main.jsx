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
const mql = window.matchMedia("screen and (max-width: 1200px)")
if (mql.matches) { // if media query matches
about.write(`
-==~ Brandon Kase ~==-

Bringing typed FP to weird places.

Now @ O(1) Labs (Cryptocurrency/OCaml)
Before @ Pinterest, Highlight, Facebook
Studied @ Carnegie Mellon, SCS 2014

This is a unix-like shell on an
in-memory filesystem.
Try cat,ls,cp,rm,mkdir,cd,echo,sh.
I/O redirection works.
You can even run sh inside this sh!

"sh < /bin/contactme.sh" to contact me.
"sh < /bin/blog.sh" to go to blog.
"sh < /bin/resume.sh" to get resume.`);
} else {
about.write(`
   --------------------------------------------------------------
   |                                                            |
   |                   -==~ Brandon Kase ~==-                   |
   |                                                            |
   |  Bringing typed functional programming to weird places.    |
   |                                                            |
   |  Now @ O(1) Labs (Cryptocurrency hacking in Ocaml)         |
   |  Previously @ Pinterest, Highlight, Facebook, Mozilla      |
   |  Studied @ Carnegie Mellon, SCS 2014                       |
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
}
about.end();

fs.mkdir(fs.pathFromString('/', 'bin'));
const contactmesh = fs.writeFileStream(fs.pathFromString('/bin', 'contactme.sh'));
contactmesh.write("echo brandon        .       kase    @  gmail                 . com");
contactmesh.end();
const blogsh = fs.writeFileStream(fs.pathFromString('/bin', 'blog.sh'));
blogsh.write("open http://hkr.me");
blogsh.end();
const resumesh = fs.writeFileStream(fs.pathFromString('/bin', 'resume.sh'));
resumesh.write("open todo");
resumesh.end();

console.log("-----------------------------------");
console.log("-- If you want the source go to: --");
console.log("-- https://github.com/bkase/site --");
console.log("-----------------------------------");

