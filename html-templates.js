exports.index = '<!DOCTYPE html><html><head><title>Brightstorage</title><meta charset="utf-8"></head><body><form action="/admin/upload" method="POST" enctype="multipart/form-data"><input type="file" name="new_file"><br/><input type="submit" value="Upload"></form><br/><table>{files}</table></body></html>';
exports.imagePreview = '<tr><td><img src="{src}" style="max-width: 128px; max-height: 128px;"></td><td><input type="text" value="{link}" style="width: 450px"></td><td><a href="{remove_url}">Remove</a></td></tr>';
exports.filePreview = '<tr><td></td><td><input type="text" value="{link}" style="width: 400px"></td><td><a href="{remove_url}">Remove</a></td></tr>';




