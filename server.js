const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

const port = '8081';

var app = express();

app.get('/scrape', function(req, res){
    
    // url to scrape from
    let url = 'http://www.imdb.com/title/tt1229340/';

    // request call, params are url and callback
    // takes 3 params - error, response status call and scraped html
    request(url, (error, response, html) => {
        // the vars we want to capture
        let title, release, rating;
        let json = { title: "", release: "", rating: "" };
        
        if(!error){
            // using cheerio on returned html will give us jQuery functionality
                // aliased in the usual way - with $
            var $ = cheerio.load(html);

            // grab are title by traversing the DOM with jQuery style
                // methods: thanks Cheerio!
            
            // titleWrapper is the wrapper containing title and release year
            let titleWrapper = $('.title_wrapper h1');

            release = titleWrapper.find('#titleYear').find('a').text();
            json.release = release;

            // the title is outside all inner tags in the h1
            title = titleWrapper.children().remove().end().text().trim();
            json.title = title;

            // get IMDB star rating
            rating = $('.imdbRating strong span').text();
            json.rating = rating;
        }
        else{
            console.error(error);
        }

        // write json to file
        fs.writeFile('output.json', JSON.stringify(json, null, 4), (err) => {
            console.log('File successfully written! - check output.json');
        });

        res.send('Check your console');

    });

});

app.listen(port);
console.log(`listening on port ${port}`);
exports = module.exports = app;
