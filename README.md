# Restaurant Reviews
Restaurant reviews is a project include in Udacity's Mobile Web Specialist Nanodegree program. It is a 3 stage project.

## Stage One
I will have take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. I will also begin converting this to a Progressive Web Application by caching some assets for offline use.

## Stage Two
I will take the responsive, accessible design I built in Stage One and connect it to an external server. I’ll begin by using asynchronous JavaScript to request JSON data from the server. I’ll store data received from the server in an offline database using IndexedDB, which will create an app shell architecture. Finally, I’ll work to optimize my site to meet performance benchmarks, which I’ll test using Lighthouse.

Since I am working on stage Two, So i am not including any of forthcoming stages. I will definitely include it once i will completed this stage two successfully.

## Specification
- **In Stage One**
I have been provided code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. It is my job is to update the code to resolve these issues while still maintaining the included functionality.
- **In Stage Two**
I will be provided code for a Node development server and a README for getting the server up and running locally on your computer. The README will also contain the API you will need to make JSON requests to the server. Once I have the server up, I will begin the work of improving my Stage One project code.
The core functionality of the application will not change for this stage. Only the source of the data will change. I will use the fetch() API to make requests to the server to populate the content of my Restaurant Reviews app.

## Requirements
- Install Python on your computer system. [Download here](https://www.python.org/)
- Install NodeJs & Npm(Node package manager) on your computer system. [Download here](https://nodejs.org/en/download/)
- Install Gulp on your system using this command - `npm install gulp-cli -g`

### Note -
If you are on Linux system
- For python 2x Run this command `sudo apt-get install python`
- For python 3 Run this command `sudo apt-get install python3`
- For nodejs Run bellow commands one by one -
 1. `sudo apt-get install curl python-software-properties`
 2. `curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`
 3. `sudo apt-get install nodejs`
 4. Congrats now check your nodejs version by using this - `node -v`
- For npm Run this command - `sudo apt-get install npm`
 Congrats check you npm version by using - `npm -v`

## Steps To Run The Project
1. Clone the project repo at [click here](https://github.com/imrshu/mws-restaurant-stage-1.git)
2. You need to have development server up & running.
3. Clone development server repo from [here](https://github.com/imrshu/mws-restaurant-stage-2.git)
4. Once you have cloned both repositories mentioned above.
5. Open up terminal & go to development server repo folder.
6. Run this command `npm install` this will install project dependencies.
7. Run this command `npm run serve` this will start the development server.
8. Now that you have the development server up and running its time to run restaurant reviews app server.
9. Open up another terminal & go to restaurant reviews app folder.
10. Run this command - `gulp` this will concat, uglify, minify & compress images for production use.
11. Now close the gulp operation using `ctrl+c`.
12. Run this command - `python -m SimpleHTTPServer 8000` for python2.x users.
13. Run this command - `python3 -m http.server 8000` for python3.x users.
14. Now your restaurant reviews app server is up & running.
15. Great!! Now open up your favourite browser and visit `http://localhost:8000`
