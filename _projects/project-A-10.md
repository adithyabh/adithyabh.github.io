---
title: "<center>Raft Distributed System & Sharded K-V Store</center>"
excerpt: "<center><i>May-July 2020</i><br/><img src='/images/raft.png' width='400'><br/>A Golang implemenation of the Raft consensus protocol.</center>"
collection: projects
---
<p align="center">
  <img src="../../images/raft.png"/>
</p>
Distributed Systems are cool. I found out that MIT 6.824 had put up its labs online publicly, so I followed along. On the journey I built a Raft Distributed System that can handle load well, and used it as the basis for a sharded Key-Value store. The sharding and load-balancing are automatic, so the system can always avoid uneven load. I've put up the code I wrote [here](https://github.com/testzer0/Distributed-Systems-Labs-6.824).
