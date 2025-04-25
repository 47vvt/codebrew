// a library of functions for annotating the existing graph

const library = `
import sys
from collections import *
from heapq import *

def colour(u, color="red"):
    """Color a node in the visualization"""
    print(f"__GRAPH__ colour {u} {color}")

def traverse(u, v, color="blue"):
    """Visualize traversal from node u to node v"""
    print(f"__GRAPH__ traverse {u} {v} {color}")


`

export default library
