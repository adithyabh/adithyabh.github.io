---
title: "<center>Blockchain simulation with Selfish and Stubborn Attacks</center>"
excerpt: "<center><i>March-May 2023</i><br/><img src='/images/blockchain-sim.png' width='400'><br/>An extensive blockchain simulator, that can also simulate selfish and stubborn mining attacks.</center>"
collection: projects
---
<p align="center">
  <img src="../../images/blockchain-sim.png"/>
</p>
As part of the Blockchains course at IIT Bombay, I built a simulator for bitcoin-style blockchains. It supports various parameters including number of nodes, node degree distribution, number of slow/fast-network nodes, number of low/high (cpu-)power nodes, mean of transaction generation and block mining times, and so on. It can simulate around 100,000 seconds worth of events for 100 nodes, accurate to millisecond-intervals, in an hour. Detailed metrics of the revenue ratios and mining success rates (both specificity and selectivity) are saved to logfiles and connectivity graphs and blocktrees are saved as images. I studied the scaling behaviors of [Selfish](https://arxiv.org/abs/1507.06183) and [Stubborn](https://eprint.iacr.org/2015/796.pdf) mining attacks as part of the course. There is more information along with the code over at [GitHub](https://github.com/testzer0/Blockchain-Simulator).
