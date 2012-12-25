var STORAGE_PATH = '/home/eireen/brightstorage_files',
    SRC_PREFIX = 'http://localhost:50000/storage/',
    REMOVE_PREFIX = 'remove/';

var fs = require( "fs" ),
    crypto = require( "crypto" ),
    util = require( "util" ),
    html = require( "./html-templates" );

exports.files = function( callback ) {
    fs.readdir( STORAGE_PATH, function( err, files ) {
        if ( err ) {
            throw err;
        }

        var gotTime = [];
        for ( var i = 0; i < files.length; i++ ) {
            (function( i ) {
                fs.stat( STORAGE_PATH + '/' + files[ i ], function( err, stat ) {
                    if ( err ) {
                        throw err;
                    }
                    files[ i ] = {
                        name: files[ i ],
                        time: stat.mtime
                    }
                    gotTime.push( true );
                    if ( gotTime.length === files.length ) {
                        files.sort( function( file1, file2 ) {
                            return file2.time - file1.time;
                        } );
                        var html_files = wrapInHtml( files );
                        callback( html.index.replace( '{files}', html_files ) );
                    }
                } );
            })( i );
           }
    } );
}

function wrapInHtml( files ) {
    var html_list = '',
        file_url,
        remove_url,
        template;

    for ( var i = 0; i < files.length; i++ ) {
        file_url = SRC_PREFIX + files[ i ].name;
        remove_url = REMOVE_PREFIX + files[ i ].name;
        template = ( isImage( files[ i ].name ) ) ? html.imagePreview : html.filePreview ;

        html_list += template
            .replace( '{src}', file_url )
            .replace( '{link}', file_url )
            .replace( '{remove_url}', remove_url );
    }

    return html_list;
}

exports.upload = function( req, callback ) {
    var id = 'new_file',
        path,
        ext,
        hash,
        hash_name,
        new_path;

    if ( !req.files[ id ].size ) {
        //TODO: What???
        fs.unlink( req.files[ id ].path, function( err ) {
            if ( err ) {
                throw err;
            }
        } );
        callback();
        return;
    }
    path = req.files[ id ].path;
    ext = path.substr( path.indexOf( '.' ) + 1 );

    fs.readFile( path, function( err, content ) {
        if ( err ) {
            throw err;
        }
        hash = crypto.createHash( 'sha1' ).update( content ).digest( 'base64' );
        hash = hash
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '')
            .replace(/^[+-]+/g, '');
        hash_name = hash + '.' + ext;
        new_path = STORAGE_PATH + '/' + hash_name;
        fs.rename( path, new_path, function( err ) {
            if ( err ) {
                throw err;
            }
            callback();
        } );
    } );


}

exports.remove = function( file, callback ) {
    var path = STORAGE_PATH + '/' + file;
    fs.exists( path, function( exists ) {
        if ( exists ) {
            fs.unlink( path, function( err ) {
                if ( err ) {
                    throw err;
                }
                callback();
            } );
        } else {
            //TODO: What???
            callback();
        }
    } );

}

function isImage( file_name ) {
    var imageExts = [ 'png', 'jpg', 'jpeg', 'ico', 'gif', 'bmp' ];

    for ( var i = 0; i < imageExts.length; i++ ) {
        if ( endsWith( file_name, imageExts[ i ] ) ) {
            return true;
        }
    }

    return false;
}

function endsWith( str, suffix ) {
    for ( var i = 1; i < arguments.length; i++ ) {
        var suffix = arguments[i];
        if ( str.indexOf( suffix, str.length - suffix.length ) !== -1 ) {
            return true;
        }
    }
    return false;
}