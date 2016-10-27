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