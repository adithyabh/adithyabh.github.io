---
title: "<center>Reverse Dictionary</center>"
excerpt: "<center><i>March - May 2022</i><br/><img src='/images/reversedict.jpg' width='400'><br/>A Reverse Dictionary + A high quality dataset of (word, meaning) pairs.</center>"
collection: projects
---
<p align="center">
  <img src="../../images/reversedict.jpg"/>
</p>
How often have you tried to remember that one pesky word whose meaning you recall? A reverse dictionary maps meanings to words, easing the pain. At the time, all datasets of (word, meaning) pairs were incredibly noisy, resulting in low accuracies of all existing models. With this work, I curated a novel dataset of nearly 90000 new, high-quality pairs to train on. Even with a simple BERT+BiLSTM model, the new dataset leads to top-1 and top-100 accuracies that are 5.4 and 1.13 times higher than the State-of-the-Art, respectively. Both the dataset and the model code are [hosted on GitHub](https://github.com/testzer0/ReverseDictionary).
