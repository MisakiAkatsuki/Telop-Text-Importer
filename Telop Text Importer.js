/// <reference path="C:/Users/RUI/OneDrive/lib/aftereffects.d.ts/ae.d.ts"/>
(function () {
    var _STRINGS = {
        JP: {
            LOAD: "ファイルを開く",
            SPLIT: "区切り文字を入力してください.\nなにも入力しない場合は改行で区切られます."
        },
        EN: {
            LOAD: "Load File",
            SPLIT: "Input split text\nif text is non, use Return."
        }
    };
    var ADBE_TEXT_PROPERTIES = "ADBE Text Properties";
    var ADBE_TEXT_DOCUMENT = "ADBE Text Document";
    var ADBE_MARKER = "ADBE Marker";
    var LOAD_SUPPORT_EXTENTION = ["All files:*.*", "Text files:*.txt"];
    var EXPRESSION_TEXT = "// var result = text.sourceText;\nvar result = \"\";\nif(0 < thisLayer.marker.numKeys){\n  var nearMarker = thisLayer.marker.nearestKey(time);\n  if(time < nearMarker.time){\n    if(nearMarker.index-1 != 0){\n      result = thisLayer.marker.key(nearMarker.index-1).comment;\n    }\n  }else{\n    result = thisLayer.marker.key(nearMarker.index).comment;\n  }\n}\n\nresult;";
    var getLocalizedText = function (str) {
        if (app.isoLanguage == "ja_JP") {
            return str.jp;
        }
        else {
            return str.en;
        }
    };
    var isCompActive = function (comp) {
        if (!(comp && comp instanceof CompItem)) {
            return false;
        }
        else {
            return true;
        }
    };
    var isLayerSelected = function (layers) {
        if (layers.length === 0) {
            return false;
        }
        else {
            return true;
        }
    };
    var main = function () {
        var actComp = app.project.activeItem;
        if (!isCompActive(actComp)) {
            return 0;
        }
        var folderPath = Folder.desktop;
        if (app.project.file != null) {
            folderPath = app.project.file.parent;
        }
        var fileName = decodeURIComponent(folderPath);
        var filePath = new File(fileName).openDlg(getLocalizedText({ jp: _STRINGS.JP.LOAD, en: _STRINGS.EN.LOAD }), LOAD_SUPPORT_EXTENTION);
        if (filePath == null) {
            return 0;
        }
        var line = [];
        var splitText = prompt(getLocalizedText({ jp: _STRINGS.JP.SPLIT, en: _STRINGS.EN.SPLIT }), "", "Telop Text Importer");
        if (splitText == "") {
            splitText = "\n";
        }
        try {
            filePath.open("r");
            line = filePath.read().split(splitText);
            filePath.close();
        }
        catch (err) {
            alert(err, "Telop Text Importer");
        }
        if (line.length == 0) {
            return 0;
        }
        var selLayers = actComp.selectedLayers;
        var telopLayers = [];
        // テキストレイヤーを選択している場合はテキストレイヤーのみ抽出,選択していない場合は新規追加する
        if (isLayerSelected(selLayers)) {
            for (var i = 0; i < selLayers.length; i++) {
                if (selLayers[i] instanceof TextLayer) {
                    telopLayers.push(selLayers[i]);
                }
            }
            if (telopLayers.length == 0) {
                telopLayers = [actComp.layers.addText("Telop")];
            }
        }
        else {
            telopLayers = [actComp.layers.addText("Telop")];
        }
        var timeInterval = 0;
        for (var i = 0; i < telopLayers.length; i++) {
            // レイヤーのインポイントからアウトポイントまでを範囲にマーカーを追加する
            timeInterval = (telopLayers[i].outPoint - telopLayers[i].inPoint) / line.length;
            for (var j = 0; j < line.length; j++) {
                telopLayers[i].property(ADBE_MARKER).setValueAtTime(timeInterval * j + telopLayers[i].inPoint, new MarkerValue(line[j]));
            }
            telopLayers[i].property(ADBE_TEXT_PROPERTIES).property(ADBE_TEXT_DOCUMENT).expression = EXPRESSION_TEXT;
        }
        return 0;
    };
    app.beginUndoGroup("Telop Text Importer");
    main();
    app.endUndoGroup();
    return 0;
}).call(this);
