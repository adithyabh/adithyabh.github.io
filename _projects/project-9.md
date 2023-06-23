---
title: "<center>RTL-to-C Decompiler</center>"
excerpt: "<center><i>September-November 2020</i><br/><img src='/images/rtldecompiler.png' width='400'><br/>Recovering source code from the compiled RTL.</center>"
collection: projects
---
<p align="center">
  <img src="../../images/rtldecompiler.png"/>
</p>
Compilers take source code in a high-level language like C and turn it into assembly. Decompilers do the opposite. Recovering code from assembly is very useful, for instance in malware analysis and binary optimization. Since assembly decompilation is slightly underspecified (needs some assumptions), my teammates and I worked with RTL (the stage just before assembly) instead. Our decompiler can convert any compiled RTL to an *executable* (i.e. compilable) C program with ease. We topped it off with a web frontend. There's more information with the [implementation](https://github.com/testzer0/gcc-rtl-decompiler).
