var STORAGE_PATH = '/home/eireen/brightstorage_files',
    SRC_PREFIX = 'storage/',
    REMOVE_PREFIX = 'remove/';

var fs = require( "fs" ),
    crypto = require( "crypto" ),
    html = require( "./html-templates" );

exports.files = function( callback ) {
    fs.readdir( STORAGE_PATH, function( err, files ) {
        if ( err ) {
            throw err;
        }
        var html_files = wrapInHtml( files );
        callback( html.index.replace( '{files}', html_files ) );
    } );
}

function wrapInHtml( files ) {
    var html_list = '',
        file_url;

    for ( var i = 0; i < files.length; i++ ) {
        file_url = SRC_PREFIX + files[ i ];
        remove_url = REMOVE_PREFIX + files[ i ];
        html_list += html.file
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
