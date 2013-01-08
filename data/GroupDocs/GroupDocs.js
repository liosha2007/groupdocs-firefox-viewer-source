
var ApiInvoker = {
    init: function (serverUrl, privateKey, var3, var4){
        
    }
};

var MgmtAPI = {
    GetUserProfile: function (clientId, callback){
        callback({ code: 200 });
    }
};

var StorageAPI = {
    listFiles: function (clientId, path, callback) {
        if (path == '/') {
            callback(
                {
                    dirs: [
                        {
                            name: 'testDir1',
                            guid: '10000001'
                        },
                        {
                            name: 'testDir2',
                            guid: '10000002'
                        },
                        {
                            name: 'testDir3',
                            guid: '10000003'
                        }
                    ],
                    files: [
                        {
                            name: 'testFile1.txt',
                            guid: '00000001'
                        },
                        {
                            name: 'testFile2.txt',
                            guid: '00000002'
                        },
                        {
                            name: 'testFile3.txt',
                            guid: '00000003'
                        },
                        {
                            name: 'testFile4.txt',
                            guid: '00000004'
                        },
                        {
                            name: 'testFile5.txt',
                            guid: '00000005'
                        },
                        {
                            name: 'testFile6.txt',
                            guid: '00000006'
                        }
                    ]
                }
            );
        }
        else if (path == '/testDir1/') {
            callback(
                {
                    dirs: [
                        {
                            name: 'testDir4',
                            guid: '10000004'
                        }
                    ],
                    files: [
                        {
                            name: 'testFile7.txt',
                            guid: '00000007'
                        },
                        {
                            name: 'testFile8.txt',
                            guid: '00000008'
                        }
                    ]
                }
            );
        }
    },
    rename: function (fileId, newName) {

    },
    copy: function (clientId, fileId, path){
        alert('clientId=' + clientId);
        alert('fileId=' + fileId);
        alert('path=' + path);
    }
};