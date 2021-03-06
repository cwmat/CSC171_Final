# CSC 171 Final Project

##Adoption of Wind Energy Development in the US
###CSC 171 - Studio 2 Group 1
###Final Project
####Charles Mateer
####Max DeCurtins

## Screen Cast
https://www.youtube.com/watch?v=r_5PNPrauyo&feature=youtu.be

## Project Plan and Process Book
https://docs.google.com/document/d/1kHICIMvkXZ3fVqiphRKspV8D2Ubtl5ZH3fxHVwEuoQM/edit?usp=sharing

## Project Poster
https://drive.google.com/a/harvard.edu/file/d/0B2p40JTTf-UaN216SlZIRzRWSE0/view?usp=sharing

## Introduction
Wind power captures the natural wind in our atmosphere and converts it into mechanical energy and ultimately electricity. Wind energy has been around since recorded history, starting with use in sail boats as early as 5,000 B.C. and wind mills for grinding grain in the 1800s.  It wasn’t until 1890 that wind energy began being experimented with as a means to produce electricity and not until 1970 that commercial wind energy was explored as a viable option.   The combination of increasing prices for fossil fuels and  the rise of environmental movements and subsequently federal environmental policies (Clean Air Act, Clean Water Act, National Environmental Policy Act) sparked an interest in renewable energy.  That is to say, energy that is sustainable and has limited negative effects on the natural environment.  Today, wind energy is a rapidly growing industry, largely due to federal policy and the need to find renewable sources of energy to supplement fossil fuels in an environment of ever growing population.  The following visualizations show past, current, and projected trends for wind energy in the United States.

## Choropleth Map
The following visualization utilizes wind turbine data from the United States Geological Survey (USGS).  The USGS has put together a dataset of over 47,000 wind turbine locations across the United States each of which gathers information such as total energy capacity provided by each turbine, rotor sweep area, blade length, and the year that the project went live.  The dataset was put together from a variety of sources and begins in 1981 (with the first major utility-scale wind farm in California) to the present.  Using GIS software, these wind turbine points were spatially joined to a GIS dataset of state boundaries.  The data from the turbine dataset were then summed (total capacity) or averaged (blade length, turbine height, and rotor sweep area) by state and by year.  The resulting dataset is shown below, where color classes show total installed wind energy capacity per state for each year (see the time slider).  California lead the way in terms of wind energy development for about a decade until about 1992 when the Energy Policy Act was signed, allowing an energy production tax credit for wind power which revitalized interest in renewable energy in a time of rising gas prices.  At around the year 2000 a drastic increase in wind capacity per state can start to be seen.  Wind energy development is driven by a number of factors including wind speed (as seen in the National Renewable Energy Laboratories maps to the right), proximity to transmission lines, and local land use policies and tax credits.  Action by federal entities has helped shaped the current state of wind energy today.  In 2008 the U.S. Department of Energy published their 20% Wind Energy by 2030 report which called for 20% of U.S. energy to be produced by wind.  This trend can be seen by moving the time slider below to the 2000’s!

## Parallel Coordinates
The American Wind Energy Association advocates for the increase of wind energy in the United States and in doing so collects a large amount of metrics on wind energy development per state.  The following visualization shows wind energy statistics for U.S. states in 2014.  Statistics include such areas as total wind energy capacity per state, jobs provided by the wind energy sector, wind energy facilities in each state, water saved by developing wind energy (instead of other water intensive energy sources like natural gas), and green-house gas emissions avoided by using a clean renewable source.  The following diagram has states broken into regions by color: west, mid-west, southwest, northeast, and southeast.  Each line on the graph represents a state and shows their various wind energy statistics.  Try clicking and dragging on an axis to filter the dataset!

## Multi-series Path Chart
This visualization shows hourly output in MW from wind in California for nearly every day between April 2010 and April 2016. The data was scraped from the California Independent System Operator (CAISO) website using PHP and cURL. There are 2,172 paths in this chart, with each path representing one day's worth of hourly data. The paths are colored according to year and are at 5% opacity to reduce visual clutter and help make larger trends more visible. The paths use basis interpolation.

## Vertical Scatter Plot/Heatmap
This visualization shows wind generation capacities for each state as projected by the National Renewable Energy Laboratory (NREL) through 2030. The data was compiled from a PDF report by NREL based on projections originally modeled as choropleth maps. Modeling the data as a series of columns allows for much easier comparison between projections for different years. The actual data for 2014 is pulled from the same dataset that is used in this project's Choropleth Map. Capacity ranges for each state were input according to their minimum values, e.g. a state projected to have 1,000 - 5,000 MW of capacity in a given year is entered as 1000 in the dataset for that year.

Live Link:
http://cwmat.github.io/CSC171_Final
