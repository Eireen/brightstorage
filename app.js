var express = require( 'express' ),
    http = require( 'http' ),
    storageManager = require( './storageManager' );

var STORAGE_PATH = '/home/eireen/brightstorage_files';

var app = express();

app.configure( function () {
    app.set( 'port', process.env.PORT || 50001 );
    app.use( express.favicon( __dirname + '/favicon.ico' ) );
    app.use( express.logger( 'dev' ) );
    app.use( express.bodyParser( { uploadDir: STORAGE_PATH, keepExtensions: true } ) );
    app.use( express.methodOverride() );
    app.use( app.router );
} );

app.configure( 'development', function() {
    app.use( express.errorHandler() );
} );

app.get( '/', function( req, res ) {
    storageManager.files( function( html ) {
        res.send( html );
    } );
} );

app.post( '/upload', function( req, res ) {
    storageManager.upload( req, function () {
        res.redirect( '/' );
    } )
});

app.get( '/remove/:file', function( req, res ) {
    storageManager.remove( req.params.file, function () {
        res.redirect( '/' );
    } );
} );

http.createServer( app ).listen( app.get( 'port' ), function() {
    console.log( "Express server listening on port " + app.get( 'port' ) );
} );
