

var clientId = null;
var privateKey = null;
var apiServer = "https://api.groupdocs.com/v2.0/";
var storage = {};
var tabsToBlocks = {
    listFilesTab: 'listFilesBlock', 
    showFileTab: 'showFileBlock',
    uploadFileTab: 'uploadFileBlock'
};

// Enter point
self.port.on("show", function onShow() {
    // Login button
    $('#authFormBtn').click(function (){
        $('#authErrorMsg').hide();
        var cid = $('#clientId').val();
        var pkey = $('#privateKey').val();
        isCorrectCredentials(cid, pkey, function (res){
            if (res.code == 200) {
                self.port.emit('saveCredentials', { 'username' : cid, 'password' : pkey });
                clientId = cid;
                privateKey = pkey;
                $('#authTable').hide();
                $('#mainTable').show();
                mainTableShowed();
            }
            else {
                $('#authErrorMsg').show();
            }
        });
    });
    // Logout button
    $('#logout').click(function (){
        self.port.emit('clearCredentials', { 'username' : clientId, 'password' : privateKey });
        $('#authTable').show();
        $('#mainTable').hide();
        $('#clientId').val('');
        $('#privateKey').val('');
        clientId = null;
        privateKey = null;
    });
});
// Unknown user
self.port.on('noCredentials', function (){
    console.log('noCredentials');
});
// User logged
self.port.on('okCredentials', function (credential){
    console.log('okCredentials');
    console.log('credential.username = ' + credential.username);
    console.log('credential.password=' + credential.password);
    $('#authTable').hide();
    $('#mainTable').show();
    mainTableShowed();
});
// Check clientId and Private Key
function isCorrectCredentials(cid, pkey, callback) {
    ApiInvoker.init(apiServer, pkey, null, true);
    MgmtAPI.GetUserProfile(cid, callback);
}

function mainTableShowed(){
    // Reset old values
    $('#filesTree').html('');
    storage = {};
    // Load new values
    loadFiles('/', $('#filesTree'));
    // Go button behavior
    $('#goId').click(function (){
        resetSelect();
        $('#' + $('#fileId').val()).addClass('selected');
        $('#listFilesTab').click();
    });
    // Tab switched
    $('.tab').each(function (index, elem){
        $(elem).click(function (){
            $('.selected-tab').removeClass('selected-tab');
            $(this).addClass('selected-tab');
            for (var key in tabsToBlocks){
                $('#' + tabsToBlocks[key]).hide();
            }
            $('#' + tabsToBlocks[this.id]).show();
        });
    });
    // Show clicked
    $('#showBtn').click(function (){
        var src = 'https://apps.groupdocs.com/document-viewer/Embed/' + $('#fileId').val() + '?quality=50&use_pdf=False&download=False';
        $('#previewFrame').attr('src', src);
        $('#showFileTab').click();
    });
    // Rename button functional
    $('#renameBtn').click(function (){
        var editableDiv = $('#filesTree').find('div.selected');
        if (editableDiv) {
            editableDiv.addClass('editable');
            editableDiv.attr('contenteditable', true);
            editableDiv.focus();
            editableDiv.blur(function (){
                editableDiv.removeClass('editable');
                editableDiv.removeAttr('contenteditable');
                StorageAPI.rename(editableDiv.attr('id'), editableDiv.html());
                return false;
            });
        }
    });
    $('#copyBtn').click(function (){
        var editableDiv = $('#filesTree').find('div.selected');
        if (editableDiv) {
            var guid = editableDiv.attr('id');
            showDirSelectDialog(function (path, params) {
                StorageAPI.copy(clientId, params.guid, path);
            }, { guid: guid });
        }
    });
}

function resetSelect(){
    $('#filesTree').find('div.selected').removeClass('selected');
}

function loadFiles(path, parent) {
    if ($(parent).children('ul').length == 0){
        StorageAPI.listFiles(clientId, path, function (res){
            var ul = $('<ul></ul>');
            for (var n = 0; n < res.dirs.length; n++) {
                var dirName = res.dirs[n].name;
                var guid = res.dirs[n].guid;
                var li = $('<li class="dir"></li>');
                var textDiv = $('<div id="' + guid + '">' + dirName + '</div>');
                textDiv.click(function (event){
                    resetSelect();
                    loadFiles(storage[this.id].path, storage[this.id].li);
                    $(this).addClass('selected');
                    dirSelected(this);
                });
                li.append(textDiv);
                storage[guid] = {
                    path: path + dirName + '/', 
                    li: li
                };
                ul.append(li);
            }
            for (var n = 0; n < res.files.length; n++) {
                var li = $('<li class="file"></li>');
                var textDiv = $('<div id="' + res.files[n].guid + '">' + res.files[n].name + '</div>');
                textDiv.click(function (event){
                    resetSelect();
                    $(this).addClass('selected');
                    fileSelected(this);
                });
                li.append(textDiv);
                ul.append(li);
            }
            parent.append(ul);
        });
    }
    else {
        $(parent).parent().find('ul').remove();
    }
}

function dirSelected(elem){
    $('#fileId').val('');
    $('#showBtn').attr('disabled', 'disabled');
    $('#downloadBtn').attr('disabled', 'disabled');
    $('#copyBtn').attr('disabled', 'disabled');
    $('#moveBtn').attr('disabled', 'disabled');
    $('#renameBtn').removeAttr('disabled');
}

function fileSelected(elem){
    $('#fileId').val(elem.id);
    $('#showBtn').removeAttr('disabled');
    $('#downloadBtn').removeAttr('disabled');
    $('#copyBtn').removeAttr('disabled');
    $('#moveBtn').removeAttr('disabled');
    $('#renameBtn').removeAttr('disabled');
}

var dirStorage = {};
function loadDirs(path, parent) {
    if ($(parent).children('ul').length == 0){
        StorageAPI.listFiles(clientId, path, function (res){
            var ul = $('<ul></ul>');
            for (var n = 0; n < res.dirs.length; n++) {
                var dirName = res.dirs[n].name;
                var guid = res.dirs[n].guid;
                var li = $('<li class="dir"></li>');
                var textDiv = $('<div id="' + guid + '">' + dirName + '</div>');
                textDiv.click(function (event){
                    $('#selectDialogContent').find('div.selected').removeClass('selected');
                    loadDirs(dirStorage[this.id].path, dirStorage[this.id].li);
                    $(this).addClass('selected');
                    dirSelected(this);
                });
                li.append(textDiv);
                dirStorage[guid] = {
                    path: path + dirName + '/', 
                    li: li
                };
                ul.append(li);
            }
            parent.append(ul);
        });
    }
    else {
        $(parent).parent().find('ul').remove();
    }
}

function showDirSelectDialog(callback) {
    $('<div id="dirSelectDialog" class="dirSelectDialog"></div>').appendTo('body');
    $('#dirSelectDialog').append('<div class="selectDialogTitle">Please, select directory in witch you want to copy file:</div>');
    $('#dirSelectDialog').append('<div id="selectDialogContent"></div>');
    var btnBlock = $('<div class="dirSelectDlgBtnBlock"></div>');
    $('#dirSelectDialog').append(btnBlock);
    btnBlock.append('<input type="button" id="dirSelectOkBtn" class="dirSelectDialogBtn" value="Ok" />');
    btnBlock.append('<input type="button" id="dirSelectCancelBtn" class="dirSelectDialogBtn" value="Cancel" />');
    $('#dirSelectOkBtn').click(function () {
        $('#dirSelectDialog').remove();
    });
    $('#dirSelectCancelBtn').click(function () {
        $('#dirSelectDialog').remove();
    });
    dirStorage = {};
    loadDirs('/', $('#selectDialogContent'), false);
}










function mydump(arr) { 
    var dumped_text = '';
    for(var item in arr) {
        var value = arr[item];
        dumped_text += "'" + item + "' => \"" + value + "\"\n";
    }
    return dumped_text;
}