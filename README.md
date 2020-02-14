Find My Representative
============

A Leaflet-based mapping website that offers some basic tools to help residents 
of greater Los Angeles find their representative.  The website uses geoJSON
and Leaflet to render political and jurisdictional boundaries focusing on
greater Los Angeles.  

This is a stand alone client-based website that can also serve as a launching 
point for others to learn Leaflet, basic client-based spatial operations and 
some of the amazing Leaflet plugins.

# Install

This is an entirely self contained client-based web application.  All necessary
source and data files are in this repository.  To install, clone this repository
into a local folder you can use to run websites.

To properly run this in production, you would edit the path to the Leaflet
Javascript, CSS and a few other bits in index.html to point to their Internet-based
hosted locations.

# Run

I choose to run this locally using a lightweight Python webserver.  I launch it
using basic default configuration.

python -m SimpleHTTPServer 8000 

This launches as web server on my laptop on port 8000

I then interact with the Find My Representative website via http://localhost:8000

# Live Demo

This code is currently running this site:  http://lupinex.com/fmr

# Using

Find my representative has 3 basic use modes:

* Browsing and exploring - pan around the map and select the various layers.  When you 
hover over a particular jurisdiction such as a neighborhood council district or a
California Senate district, you can immediately get some details in the informational
window in the top right.
* Details about a specific jurisdiction - if you want to get details about a specific
jurisdiction so that you can click to navigate to their website or get their contact
information, click on the area and you will see a popup with all the details.
* Information about all the representatives for a specific address - you can use the
search dialog in the top left to locate an address, zoom to it and then you will see
all the details of representatives for that address

## Searching in Find My Representative

Start typing an address into the search box.  An example, 105 N Rossmore Ave, Los Angeles.  Click on the address
that matches the address you are looking for and then see the results in the area below the map.

![Image](https://github.com/CordThomas/find-my-prepresentative/blob/master/images/find-my-representative-search.png)

## Detailed results from the search
![Image](https://github.com/CordThomas/find-my-prepresentative/blob/master/images/find-my-representative-results.png)
