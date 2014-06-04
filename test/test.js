var should = require("should"),
    assert = require("assert"),
    http = require("http"),
    testFiles = 
        [
            {query: "RoboCop (2014) DVDRip XviD-MAX",           shouldHave: "english_RoboCop (2014) DVDRip XviD-MAXSPEED.srt"},
            {query: "her 2013 dvdscr xvid mp3-rarbg",           shouldHave: "english_Her.2013.DVDSCR.XviD.MP3-RARBG.srt"},
            {query: "game of thrones s04e03",                   shouldHave: "english_Game.of.Thrones.S04E03.HDTV.x264-KILLERS.srt"},
            {query: "Fargo S01E08 720p HDTV X264-DIMENSION",    shouldHave: "english_Fargo.S01E08.720p.HDTV.X264-DIMENSION.srt"},
            {query: "24 s09e06 720p hdtv x264-dimension",       shouldHave: "english_24.S09E06.HDTV.x264-LOL.srt"},
            {query: "joy.ride.3.2014.hdrip.xvid.-juggs[etrg]",  shouldHave: "english_Joy.Ride.3.2014.HDRip.XViD.-juggs[ETRG].srt"}    
        ];

describe("/get/", function() {
    it("should return 500", function (done) {
        http.get("http://localhost:8080/get/lol", function (res) {
            assert.equal(500, res.statusCode);
            done();
        });
    });
    for (var index = 0; index < testFiles.length; index++){
        testQuery(testFiles[index], function(resObj, queryObj){
        });
    };
});

function testQuery(queryObj) {
    describe("/get/", function() {
        it("should return right file", function (done) {
            http.get("http://localhost:8080/get/?title=" + queryObj.query + "&language=english", function(res) {
                var body = "";
                res.on("data", function(chunk) {
                    body += chunk;
                });

                res.on("end", function() {
                    assert.equal(JSON.parse(body).filename, queryObj.shouldHave);
                    done();
                });   
            });
        });
    });
};
