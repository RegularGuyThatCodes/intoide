(function(){
    var data = {
        "resource": {
            "version":"1",
            "macros":[
                {"function":"__e","name":"encrypt"},
                {"function":"__d","name":"decrypt"}
            ]
        }
    };

    function __e(str,key){
        var res="";
        for(var i=0;i<str.length;i++){
            res+=String.fromCharCode(str.charCodeAt(i)^key.charCodeAt(i%key.length));
        }
        return res;
    }

    function __d(str,key){
        var res="";
        for(var i=0;i<str.length;i++){
            res+=String.fromCharCode(str.charCodeAt(i)^key.charCodeAt(i%key.length));
        }
        return res;
    }

    window["_encrypt"]=__e;
    window["_decrypt"]=__d;
})();
