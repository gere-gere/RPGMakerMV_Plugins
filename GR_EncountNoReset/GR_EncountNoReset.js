//=============================================================================
// GR_EncountNoReset.js
// 作成者     :げれげれ 
// 作成日     : 2020/07/20
// 最終更新日 : 2020/07/20
// バージョン : v1.0.0
// ----------------------------------------------------------------------------
// Released under the MIT License.
// https://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 同一マップ内での場所移動の際は
 * エンカウント歩数をリセットしないように変更する
 * @author げれげれ
 *
 * @help
 *【プラグインパラメータ】
 *【プラグインコマンド】
 *【メモタグ】
 * いずれもありません。
 * 
 */

//==============================================================================

(function() {
'use strict';

//場所移動予約の際に「元のマップID」を情報として残すようにプロパティ追加
var _game_player_reserveTransfer = Game_Player.prototype.reserveTransfer;
Game_Player.prototype.reserveTransfer = function(mapId, x, y, d, fadeType) {
    _game_player_reserveTransfer.call(this, mapId, x, y, d, fadeType);
    this._oldMapId = $gameMap._mapId;
};

//移動時に_oldMapIdとmapIdに変化がなければエンカウント歩数をリセットしない
Game_Player.prototype.locate = function(x, y) {
    Game_Character.prototype.locate.call(this, x, y);
    this.center(x, y);
    if(this._oldMapId !== $gameMap._mapId) this.makeEncounterCount();
    if (this.isInVehicle()) {
        this.vehicle().refresh();
    }
    this._followers.synchronize(x, y, this.direction());
};

})();