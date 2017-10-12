const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

const port = '8081';

var app = express();

app.get('/scrape_polygon', function(req, res){
    
    // url to scrape from
    let homeURL = 'https://www.polygon.com/';
    // article url's
    let articleURLs = [];
    let json = {};

    // request call, params are url and callback
    // takes 3 params - error, response status call and scraped html
    request(homeURL, (error, response, html) => {
        
        if(!error){
            let $ = cheerio.load(html);
            $('.c-entry-box--compact__title a').each( function(index){
                articleURLs.push($(this).attr('href'));
            });
        }
        else{
            console.error(error);
        }

        articleURLs.forEach(
            (artURL, index) => {
                return request(artURL, (error, response, html) => {
                    if(!error){
                        let $ = cheerio.load(html);

                        let article = {};
                        article.title = $('.c-page-title').text();
                        $('.c-entry-hero .c-byline__item .c-byline__item').remove();
                        article.author = $('.c-entry-hero .c-byline__item:first-of-type')
                            .find('a')
                            .text();
                        article.pubDate = $('.c-entry-hero .c-byline time').text().trim();
                        // write article to json obj
                        json[artURL] = article;
                    }
                    else{
                        console.error(error);
                    }
                    // write json to file
                    fs.writeFile('polygon_output.json', JSON.stringify(json, null, 4), (err) => {
                        console.log('File successfully written! - check polygon_output.json');
                    });
                    if(index === articleURLs.length - 1){
                        res.send(json);
                    }

                })
            }
        )
        
    });

});

app.listen(port);
console.log(`listening on port ${port}`);
exports = module.exports = app;
