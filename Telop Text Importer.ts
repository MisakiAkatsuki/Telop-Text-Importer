/*
  Telop Text Importer
    (C) あかつきみさき(みくちぃP)

  このスクリプトについて
    選択したファイルからテキストを読み込み,マーカーでソーステキストを制御するテキストレイヤーを生成します.
    テキストレイヤーが選択されている時はそのすべてに,選択されていない場合は新規テキストレイヤーを追加し適用します.

  使用方法
    1.ファイル→スクリプト→スクリプトファイルの実行から実行.

  動作環境
    Adobe After Effects CS6以上

  ライセンス
    MIT License

  バージョン情報
    2016/10/27 Ver 1.0.0 Release
*/

// 追加されるエクスプレッションの解説
/*
// デフォルトのテキストをソーステキストにするには以下の通り
// var result = text.sourceText;
var result = "";

// マーカーが存在しない場合は入らない
if(0 < thisLayer.marker.numKeys){
  // インジケーター時間に近いマーカーを取得
  var nearMarker = thisLayer.marker.nearestKey(time);

  if(time < nearMarker.time){
    // インジケーター時間が取得したマーカー時間より小さいなら,一つ前のマーカーのコメントを取得
    // ただし,0番目のマーカーは存在しないので除く
    if(nearMarker.index-1 != 0){
      result = thisLayer.marker.key(nearMarker.index-1).comment;
    }
  }else{
    // インジケーター時間が取得したマーカー時間より大きいなら,そのマーカーのコメントを取得
    result = thisLayer.marker.key(nearMarker.index).comment;
  }
}

result;
*/

/// <reference path="C:/Users/RUI/OneDrive/lib/aftereffects.d.ts/ae.d.ts"/>

(function () {
  const _STRINGS = {
    JP: {
      LOAD: "ファイルを開く",
      SPLIT: "区切り文字を入力してください.\nなにも入力しない場合は改行で区切られます.",
    },
    EN: {
      LOAD: "Load File",
      SPLIT: "Input split text\nif text is non, use Return.",
    }
  };

  const ADBE_TEXT_PROPERTIES: string = "ADBE Text Properties";
  const ADBE_TEXT_DOCUMENT: string = "ADBE Text Document";
  const ADBE_MARKER: string = "ADBE Marker";

  const LOAD_SUPPORT_EXTENTION: string[] = ["All files:*.*", "Text files:*.txt"];

  const EXPRESSION_TEXT = `// var result = text.sourceText;
var result = "";
if(0 < thisLayer.marker.numKeys){
  var nearMarker = thisLayer.marker.nearestKey(time);
  if(time < nearMarker.time){
    if(nearMarker.index-1 != 0){
      result = thisLayer.marker.key(nearMarker.index-1).comment;
    }
  }else{
    result = thisLayer.marker.key(nearMarker.index).comment;
  }
}

result;`


  const getLocalizedText = function (str) {
    if (app.isoLanguage == "ja_JP") {
      return str.jp;
    } else {
      return str.en;
    }
  }

  const isCompActive = function (comp: CompItem) {
    if (!(comp && comp instanceof CompItem)) {
      return false;
    } else {
      return true;
    }
  }

  const isLayerSelected = function (layers: Layer[]) {
    if (layers.length === 0) {
      return false;
    } else {
      return true;
    }
  }

  const main = function () {
    const actComp: CompItem = <CompItem>app.project.activeItem;
    if (!isCompActive(actComp)) {
      return 0;
    }

    let folderPath: Folder = Folder.desktop;

    if (app.project.file != null) {
      folderPath = app.project.file.parent;
    }

    const fileName: string = decodeURIComponent(folderPath);
    const filePath: File = new File(fileName).openDlg(getLocalizedText({ jp: _STRINGS.JP.LOAD, en: _STRINGS.EN.LOAD }), LOAD_SUPPORT_EXTENTION);
    if (filePath == null) {
      return 0;
    }

    let line: string[] = [];
    let splitText: string = prompt(getLocalizedText({ jp: _STRINGS.JP.SPLIT, en: _STRINGS.EN.SPLIT }), "", "Telop Text Importer");

    if (splitText == "") {
      splitText = "\n";
    }

    try {
      filePath.open("r");
      line = filePath.read().split(splitText);
      filePath.close();
    } catch (err) {
      alert(err, "Telop Text Importer");
    }

    if (line.length == 0) {
      return 0;
    }

    const selLayers: Layer[] = <Layer[]>actComp.selectedLayers;
    let telopLayers: TextLayer[] = [];

    // テキストレイヤーを選択している場合はテキストレイヤーのみ抽出,選択していない場合は新規追加する
    if (isLayerSelected(selLayers)) {
      for (let i = 0; i < selLayers.length; i++) {
        if (selLayers[i] instanceof TextLayer) {
          telopLayers.push(<TextLayer>selLayers[i]);
        }
      }

      if (telopLayers.length == 0) {
        telopLayers = [actComp.layers.addText("Telop")];
      }
    } else {
      telopLayers = [actComp.layers.addText("Telop")];
    }

    let timeInterval: number = 0;
    for (let i = 0; i < telopLayers.length; i++) {
      // レイヤーのインポイントからアウトポイントまでを範囲にマーカーを追加する
      timeInterval = (telopLayers[i].outPoint - telopLayers[i].inPoint) / line.length;

      for (let j = 0; j < line.length; j++) {
        telopLayers[i].property(ADBE_MARKER).setValueAtTime(timeInterval * j + telopLayers[i].inPoint, new MarkerValue(line[j]));
      }

      telopLayers[i].property(ADBE_TEXT_PROPERTIES).property(ADBE_TEXT_DOCUMENT).expression = EXPRESSION_TEXT;
    }
  }

  app.beginUndoGroup("Telop Text Importer");
  main();
  app.endUndoGroup();

  return 0;
}).call(this);
