// a library of functions for annotating the existing graph

const library = `
import sys
from collections import *
from heapq import *

def colour(u):
    print(f"__GRAPH__ colour {u}")

def traverse(u, v):
    print(f"__GRAPH__ traverse {u} {v}")


`

export default library;