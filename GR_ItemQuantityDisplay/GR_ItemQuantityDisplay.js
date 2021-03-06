//=============================================================================
// GR_ItemQuantityDisplay.js
// 作成者     :げれげれ 
// 作成日     : 2021/03/05
// 最終更新日 : 2021/03/05
// バージョン : v1.0.2
// ----------------------------------------------------------------------------
// Released under the MIT License.
// https://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 
 * @author げれげれ
 * 
 * @param window_y
 * @type number
 * @desc アイテム残数ウインドウを表示するｙ座標です
 * @default 80
 * 
 * @param position
 * @type boolean
 * @desc 単位の表示位置を前後から選べます
 * @on 前
 * @off 後
 * @default true
 * 
 * @param unit
 * @type string
 * @desc 単位
 * @default 残：
 *
 * @help
 * メニュー画面からアクターに対しアイテムを使用する際に
 * アイテム名と残数を表示します。
 * 基本的にはプラグイン登録するだけで使えます。
 * 
 *【プラグインパラメータ】
 * アイテム残数の単位、表示位置を変更できます。
 * デフォルトは「前」「残：」です。
 * 変更例「残： 1」→「1個」
 * 
 */

//==============================================================================

(function() {
'use strict';

/* プラグインパラメータ */
const PARAMETERS = PluginManager.parameters('GR_ItemQuantityDisplay');
const WINDOW_Y = parseInt(PARAMETERS['window_y']);
const POSITION = PARAMETERS['position'] === 'true' ? true : false ;
const UNIT = PARAMETERS['unit'];

//シーン関連
const Scene_Item_create = Scene_Item.prototype.create;
Scene_Item.prototype.create = function() {
    Scene_Item_create.call(this);
    this.createQuantityWindow();
};

Scene_Item.prototype.createQuantityWindow = function() {
    this._quantityWindow = new Window_Quantity(this);
    this._quantityWindow.hide();
    this.addWindow(this._quantityWindow);
};

Scene_Item.prototype.determineItem = function() {
    const action = new Game_Action(this.user());
    const item = this.item();
    action.setItemObject(item);
    if (action.isForFriend()) {
        this.showSubWindow(this._actorWindow);
        this._actorWindow.selectForItem(this.item());
        //quantityWindowをここで表示
        this.showQuantityWindow(this._quantityWindow, this._actorWindow.width);
    } else {
        this.useItem();
        this.activateItemWindow();
    }
};

Scene_ItemBase.prototype.showQuantityWindow = function(window, actorWindowWidth) {
    window.x = this.isCursorLeft() ? 0 : actorWindowWidth;
    window.refresh();
    window.show();
};

const Scene_ItemBase_onActorOk = Scene_ItemBase.prototype.onActorOk;
Scene_Item.prototype.onActorOk = function() {
    Scene_ItemBase_onActorOk.call(this);
    this._quantityWindow.refresh();
};

const Scene_ItemBase_onActorCancel = Scene_ItemBase.prototype.onActorCancel;
Scene_Item.prototype.onActorCancel = function() {
    this._quantityWindow.hide();
    Scene_ItemBase_onActorCancel.call(this);
};


//Window関連
function Window_Quantity() {
    this.initialize.apply(this, arguments);
}

Window_Quantity.prototype = Object.create(Window_Base.prototype);
Window_Quantity.prototype.constructor = Window_Quantity;

Window_Quantity.prototype.initialize = function(parentScene) {
    this._parentScene = parentScene;
    const width = this.windowWidth();
    const height = this.windowHeight();
    Window_Base.prototype.initialize.call(this, 0, WINDOW_Y, width, height);
};

Window_Quantity.prototype.windowWidth = function() {
    return Graphics.boxWidth - this._parentScene._actorWindow.width;
};

Window_Quantity.prototype.windowHeight = function() {
    return this.fittingHeight(2);
};

Window_Quantity.prototype.refresh = function() {
    const x = this.textPadding();
    const y = this.lineHeight();
    const width = this.contents.width - this.textPadding() * 2;
    const item = this._parentScene.item();
    const value = this.itemQuantity(item);
    this.contents.clear();
    this.drawItemName(item, x, 0, width);
    if(POSITION) {
        this.drawCurrencyValueFront(value, UNIT, x, y, width);
    } else {
        this.drawCurrencyValue(value, UNIT, x, y, width);
    }
};

Window_Quantity.prototype.itemQuantity = function(item) {
    return $gameParty.numItems(item);
};

Window_Quantity.prototype.drawCurrencyValueFront = function(value, unit, x, y, width) {
    this.resetTextColor();
    this.drawText(`${unit} ${value}`, x, y, width, 'right');
};

})();