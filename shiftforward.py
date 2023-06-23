import os
import sys

start = 1
if len(sys.argv) > 1:
    start = int(sys.argv[1])

maxnum = 0
for fname in os.listdir("_projects"):
    maxnum = max(maxnum, int(fname[fname.find("-")+1:fname.find(".")]))

if maxnum < start:
    exit(0)

def getname(i):
    num_as = 0
    j = i
    while j >= 10:
        num_as -= 1
        j = j // 10
    if num_as == 0:
        return "project-{}".format(i)
    return "project-{}-{}".format("A"*num_as, i)

for i in range(maxnum, start-1, -1):
    inpath = "_projects/{}.md".format(getname(i))
    outpath = "_projects/{}.md".format(getname(i+1))
    os.system("cp {} {}".format(inpath, outpath))