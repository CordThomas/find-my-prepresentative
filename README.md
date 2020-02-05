Find My Representative
============

A Leaflet-based mapping website that offers some basic tools to help residents 
of greater Los Angeles find their representative.  The website uses geoJSON
and Leaflet to render political and jurisdictional boundaries focusing on
greater Los Angeles.  

This is a stand alone client-based website that can also serve as a launching 
point for others to learn Leaflet, basic client-based spatial operations and 
some of the amazing Leaflet plugins.

![Image](https://github.com/CordThomas/find-my-prepresentative/blob/master/images/find-my-representative.png)

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

 