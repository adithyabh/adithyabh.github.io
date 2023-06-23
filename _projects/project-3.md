---
title: "<center>Automated Data Augmentation for Robustness</center>"
excerpt: "<center><i>November 2022 - February 2023</i><br/><img src='/images/robust-1.png' width='400'><br/>Automatically generating augmentions without rules to make Text-to-SQL models more robust.</center>"
collection: projects
---
<p align="center">
  <img src="../../images/robust-1.png"/>
</p>
Text-to-SQL systems should stay consistent on slightly differing inputs. For instance, if *"Give me the name of all singers older than 50"* produces, *"SELECT name FROM singer WHERE age > 50"*, then the question *"Give me the name of all singers younger than 30"* should produce *"SELECT name FROM singer WHERE age < 30"*. However, this is not the case with most trained models (see [Dr. SPIDER](https://arxiv.org/abs/2301.08881), built by perturbing the development split of [SPIDER](https://yale-lily.github.io/spider)). As part of my Bachelor's Project, I explored automated masking of key portions of questions from SPIDER's train split and then training a masked model on them. Masking leads to natural, varied and occasionally profound variations of the output SQL query in the top-k choices. A simple SQL-to-Text model can then furnish questions for the queries, generating plenty (2-3x) of augmented data. Training on these augmentations outperforms training on Dr. SPIDER-style perturbations of the train split on robustness, and even delivers a small gain in accuracy on SPIDER. These augmentations are fully automated, naturally in-domain, and generalize easily to any seq2seq task. The code will be released soon. 
