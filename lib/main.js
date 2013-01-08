const widget = require('widget');
const data = require('self').data;
const panel = require('panel');
const passwords = require("passwords");
// Create popup panel
var main_panel = panel.Panel({
    contentURL: data.url("popup.html"),
    contentScriptFile: [
        data.url('jquery-1.6.4.min.js'),
        data.url('GroupDocs/GroupDocs.js'),
        data.url("popup.js")
    ],
    width: 640,
    height: 480
});
// Create Plugin button
var main_widget = widget.Widget({
    id: "groupDocsViewer",
    label: "GroupDocs Viewer",
    contentURL: data.url('img/icon.gif'),
    panel: main_panel
});
// Send message to popup panel script
main_panel.on("show", function() {
    main_panel.port.emit("show");
    loadCredentials()
});

function loadCredentials(){
    passwords.search({
        realm: "GroupDocsViewer",
        onComplete: function onComplete(credentials) {
            if (credentials.length == undefined || credentials.length === 0){
                main_panel.port.emit("noCredentials");
            }
            else {
                credentials.forEach(function(credential) {
                    main_panel.port.emit("okCredentials", {
                        'username' : credential.username,
                        'password' : credential.password
                    });
                });
            }
        },
        onError: function(){
            main_panel.port.emit("noCredentials");
        }
    });
}

main_panel.port.on('saveCredentials', function (credential){
    if (credential.username !== '' && credential.password !== '') {
        passwords.store({
            realm: "GroupDocsViewer",
            username: credential.username,
            password: credential.password
        });
    }
});

main_panel.port.on('clearCredentials', function (credential){
    passwords.search({
        realm: "GroupDocsViewer",
        onComplete: function onComplete(credentials) {
            credentials.forEach(passwords.remove);
        }
    });
});

